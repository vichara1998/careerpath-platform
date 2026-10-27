package lk.careerpath.careerpath_backend.dto.request;
import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
@Data
public class RecommendationRequest {
    @NotNull private QualificationLevel qualificationLevel;
    @Size(max=8) private List<@NotNull QualificationLevel> qualifications;
    @Size(max=100) private String stream;        // Science, Arts, Commerce, Tech, ICT
    @Size(max=100) private String gpa;
    @Min(1) @Max(13) private Integer highestSchoolGrade;
    @Min(10) @Max(100) private Integer age;
    @Size(max=25) private List<@NotBlank @Size(max=100) String> interests;
    @Size(max=25) private List<@NotBlank @Size(max=100) String> skills;
    @Size(max=500) private String careerGoal;
    @Pattern(regexp="(?i)^(ONLINE|PHYSICAL|HYBRID)?$") private String preferredMode;  // ONLINE, PHYSICAL, HYBRID
    @Size(max=100) private String district;
    @DecimalMin("0") private BigDecimal maxBudget;
    @Min(1) @Max(120) private Integer maxDurationMonths;
    @com.fasterxml.jackson.annotation.JsonIgnore
    @AssertTrue(message="Conflicting qualifications: choose one latest result per exam, do not combine O/L incomplete with A/L passed, and choose one current degree status. Diplomas and professional qualifications may be selected independently.")
    public boolean isQualificationCombinationValid() {
        return lk.careerpath.careerpath_backend.service.QualificationRules.conflict(qualificationLevel, qualifications) == null;
    }
}
