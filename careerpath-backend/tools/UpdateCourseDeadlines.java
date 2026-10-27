import java.sql.*;
import java.time.*;
import java.nio.file.*;
import java.util.*;
import javax.xml.parsers.DocumentBuilderFactory;

/** Deadline-only maintenance with a local backup and transactional updates. */
public class UpdateCourseDeadlines {
    public static void main(String[] args) throws Exception {
        boolean apply=Arrays.asList(args).contains("--apply");
        Properties config=new Properties();
        try(var in=Files.newInputStream(Path.of("src/main/resources/application.properties"))){config.load(in);}
        Map<String,String> env=new HashMap<>(System.getenv());
        var factory=DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
        var nodes=factory.newDocumentBuilder().parse(Path.of(".idea/workspace.xml").toFile()).getElementsByTagName("env");
        for(int i=0;i<nodes.getLength();i++){
            var node=(org.w3c.dom.Element)nodes.item(i);
            if(Set.of("USER_NAME","DB_PASSWORD","DB_URL").contains(node.getAttribute("name")))
                env.putIfAbsent(node.getAttribute("name"),node.getAttribute("value"));
        }
        if(!env.containsKey("USER_NAME")||!env.containsKey("DB_PASSWORD"))throw new IllegalStateException("Database credentials not configured");
        try(Connection db=DriverManager.getConnection(env.getOrDefault("DB_URL",config.getProperty("spring.datasource.url")),env.get("USER_NAME"),env.get("DB_PASSWORD"))){
            db.setAutoCommit(false);
            try{
                try(var stmt=db.createStatement();var rows=stmt.executeQuery("SELECT DATABASE()")){
                    rows.next();if(!"careerpath_db".equals(rows.getString(1)))throw new IllegalStateException("Unexpected database; cancelled");
                }
                record Change(long id,LocalDate before,LocalDate after){}
                var changes=new ArrayList<Change>();int missing=0,already=0;
                try(var stmt=db.createStatement();var rows=stmt.executeQuery("SELECT id, application_deadline FROM courses ORDER BY id"+(apply?" FOR UPDATE":""))){
                    while(rows.next()){
                        LocalDate before=rows.getObject(2,LocalDate.class);
                        if(before==null){missing++;continue;}
                        if(before.getYear()==2027){already++;continue;}
                        var month=YearMonth.of(2027,before.getMonthValue());
                        changes.add(new Change(rows.getLong(1),before,month.atDay(Math.min(before.getDayOfMonth(),month.lengthOfMonth()))));
                    }
                }
                System.out.println("Database=careerpath_db; update="+changes.size()+"; no deadline="+missing+"; already 2027="+already);
                if(apply&&!changes.isEmpty()){
                    Path backup=Path.of("target","course-deadlines-before-2027-"+System.currentTimeMillis()+".csv");
                    var lines=new ArrayList<String>();lines.add("course_id,original_application_deadline,new_application_deadline");
                    for(var c:changes)lines.add(c.id()+","+c.before()+","+c.after());
                    Files.write(backup,lines,StandardOpenOption.CREATE_NEW);
                    try(var update=db.prepareStatement("UPDATE courses SET application_deadline=? WHERE id=? AND application_deadline=?")){
                        for(var c:changes){
                            update.setObject(1,c.after());update.setLong(2,c.id());update.setObject(3,c.before());
                            if(update.executeUpdate()!=1)throw new IllegalStateException("Concurrent change detected; rolled back");
                        }
                    }
                    db.commit();System.out.println("Updated="+changes.size()+"; backup="+backup.toAbsolutePath());
                }else{db.rollback();System.out.println(apply?"No changes required":"Preview only; no database changes");}
            }catch(Exception error){db.rollback();throw error;}
        }
    }
}
