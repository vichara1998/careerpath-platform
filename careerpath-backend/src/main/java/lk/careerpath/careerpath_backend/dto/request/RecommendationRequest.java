package lk.careerpath.careerpath_backend.dto.request;
import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import lombok.Data;
import java.util.List;
@Data
public class RecommendationRequest {
    private QualificationLevel qualificationLevel;
    private String stream;        // Science, Arts, Commerce, Tech, ICT
    private String gpa;
    private List<String> interests;
    private List<String> skills;
    private String careerGoal;
    private String preferredMode;  // ONLINE, PHYSICAL, HYBRID
    private String district;
}
