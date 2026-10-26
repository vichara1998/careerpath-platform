import java.sql.*;
import java.util.*;

/** Preview by default; --apply backs up and normalizes existing course metadata. */
public class NormalizeCourseCatalog {
    static final List<String> DISTRICTS = List.of("Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya");
    static final List<String> FIELDS = List.of("Software Engineering", "Data Science", "Engineering", "Medicine", "Business", "Accounting", "Arts & Design", "Tourism", "Agriculture", "Education", "Cybersecurity", "Marketing", "AI/ML", "Networking", "Media Studies", "Food Technology", "Environmental Science");

    static String district(String original) {
        if (original == null) return null;
        String value = original.trim();
        String key = value.replaceAll("[\\s-]", "");
        for (String known : DISTRICTS) {
            if (known.replace(" ", "").equalsIgnoreCase(key)) return known;
        }
        if (key.equalsIgnoreCase("Moneragala")) return "Monaragala";
        if (key.equalsIgnoreCase("Killinochchi")) return "Kilinochchi";
        if (key.equalsIgnoreCase("Mulaitivu")) return "Mullaitivu";
        return original; // Unknown locations require human review.
    }

    static String fields(String original) {
        if (original == null || original.isBlank()) return original;
        Map<String, String> unique = new LinkedHashMap<>();
        for (String token : original.split("[,;]")) {
            String value = token.trim().replaceAll("\\s+", " ");
            if (value.isEmpty()) continue;
            for (String known : FIELDS) {
                if (known.equalsIgnoreCase(value)) { value = known; break; }
            }
            if (value.equalsIgnoreCase("Cyber Security")) value = "Cybersecurity";
            unique.putIfAbsent(value.toLowerCase(Locale.ROOT), value);
        }
        String result = String.join(", ", unique.values());
        return result.length() <= 200 ? result : original;
    }

    public static void main(String[] args) throws Exception {
        if (Arrays.asList(args).contains("--self-test")) {
            if (!"Nuwara Eliya".equals(district(" nuwaraeliya "))
                    || !"Monaragala".equals(district("Moneragala"))
                    || !"Unknown campus".equals(district("Unknown campus"))
                    || !"Software Engineering, Cybersecurity, Custom field".equals(fields("software engineering;Cyber Security,Software Engineering, Custom field"))
                    || fields(null) != null) {
                throw new AssertionError("Course metadata normalization failed");
            }
            System.out.println("Course metadata normalization checks passed.");
            return;
        }
        boolean apply = Arrays.asList(args).contains("--apply");
        String url = System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/careerpath_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");
        String user = System.getenv("USER_NAME");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "");
        if (user == null) throw new IllegalStateException("Set USER_NAME and DB_PASSWORD before running (an empty local password is supported).");
        try (Connection connection = DriverManager.getConnection(url, user, password)) {
            if (apply) {
                try (Statement statement = connection.createStatement()) {
                    statement.executeUpdate("CREATE TABLE IF NOT EXISTS course_profile_alignment_backup (course_id BIGINT PRIMARY KEY, district TEXT, career_fields TEXT, backed_up_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
                }
            }
            connection.setAutoCommit(false);
            int scanned = 0, changed = 0, unknown = 0;
            try (Statement statement = connection.createStatement();
                 ResultSet rows = statement.executeQuery("SELECT id, district, career_fields FROM courses" + (apply ? " FOR UPDATE" : ""));
                 PreparedStatement backup = apply ? connection.prepareStatement("INSERT IGNORE INTO course_profile_alignment_backup (course_id, district, career_fields) VALUES (?, ?, ?)") : null;
                 PreparedStatement update = apply ? connection.prepareStatement("UPDATE courses SET district=?, career_fields=? WHERE id=?") : null) {
                while (rows.next()) {
                    scanned++;
                    long id = rows.getLong("id");
                    String oldDistrict = rows.getString("district"), oldFields = rows.getString("career_fields");
                    String district = district(oldDistrict), fields = fields(oldFields);
                    if (district != null && !district.isBlank() && !DISTRICTS.contains(district)) unknown++;
                    if (Objects.equals(district, oldDistrict) && Objects.equals(fields, oldFields)) continue;
                    changed++;
                    if (apply) {
                        backup.setLong(1, id); backup.setString(2, oldDistrict); backup.setString(3, oldFields); backup.executeUpdate();
                        update.setString(1, district); update.setString(2, fields); update.setLong(3, id); update.executeUpdate();
                    }
                }
                connection.commit();
            } catch (Exception failure) {
                connection.rollback();
                throw failure;
            }
            System.out.printf("Courses scanned: %d; %s: %d; unrecognized districts preserved: %d%n", scanned, apply ? "updated" : "would update", changed, unknown);
        }
    }
}
