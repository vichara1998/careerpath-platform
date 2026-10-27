import java.sql.*;
import java.nio.file.*;
import java.util.*;
import javax.xml.parsers.DocumentBuilderFactory;

/** Repairs only published legacy rows with an unset rejection flag; preview by default. */
public class NormalizeCourseApproval {
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
                // Regression check: both false and NULL are non-rejected; no unpublished or rejected row is eligible.
                String fixtures="(SELECT 'published_null' label,1 approved,NULL rejected UNION ALL SELECT 'published_false',1,0 UNION ALL SELECT 'published_rejected',1,1 UNION ALL SELECT 'pending_null',0,NULL UNION ALL SELECT 'pending_false',0,0) c";
                Set<String> matched=new HashSet<>();
                try(var stmt=db.createStatement();var rows=stmt.executeQuery("SELECT c.label FROM "+fixtures+" WHERE c.approved = true AND (c.rejected = false OR c.rejected IS NULL)")){
                    while(rows.next())matched.add(rows.getString(1));
                }
                if(!matched.equals(Set.of("published_null","published_false")))throw new AssertionError("Published-course predicate regression");
                var ids=new ArrayList<Long>();
                try(var stmt=db.createStatement();var rows=stmt.executeQuery("SELECT id FROM courses WHERE approved=true AND rejected IS NULL ORDER BY id"+(apply?" FOR UPDATE":""))){
                    while(rows.next())ids.add(rows.getLong(1));
                }
                System.out.println("Predicate regression passed; published legacy rows="+ids.size());
                if(apply&&!ids.isEmpty()){
                    Path backup=Path.of("target","course-rejection-flags-"+System.currentTimeMillis()+".csv");
                    var lines=new ArrayList<String>();lines.add("course_id,original_rejected,new_rejected");
                    for(var id:ids)lines.add(id+",NULL,false");
                    Files.write(backup,lines,StandardOpenOption.CREATE_NEW);
                    try(var update=db.prepareStatement("UPDATE courses SET rejected=false WHERE id=? AND approved=true AND rejected IS NULL")){
                        for(var id:ids){update.setLong(1,id);if(update.executeUpdate()!=1)throw new IllegalStateException("Concurrent change; rolled back");}
                    }
                    db.commit();System.out.println("Normalized="+ids.size()+"; backup="+backup.toAbsolutePath());
                }else{db.rollback();System.out.println(apply?"No changes required":"Preview only; no changes written");}
                try(var stmt=db.createStatement();var rows=stmt.executeQuery("SELECT COUNT(*), SUM(rejected=false), SUM(rejected IS NULL) FROM courses WHERE approved=true")){
                    rows.next();System.out.println("Published="+rows.getInt(1)+"; explicit non-rejected="+rows.getInt(2)+"; empty rejection flags="+rows.getInt(3));
                }
            }catch(Exception error){db.rollback();throw error;}
        }
    }
}
