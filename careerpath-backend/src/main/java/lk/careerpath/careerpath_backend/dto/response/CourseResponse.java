package lk.careerpath.careerpath_backend.dto.response;

import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private CourseType type;
    private String level;
    private CourseMode mode;
    private BigDecimal feePerYear;
    private BigDecimal totalFee;
    private String eligibility;
    private Integer durationMonths;
    private String district;
    private String province;
    private String careerFields;
    private LocalDate intakeDate;
    private LocalDate applicationDeadline;
    private String applicationLink;
    private String brochureUrl;
    private String thumbnailUrl;
    private Boolean approved;
    private Double averageRating;
    private Integer reviewCount;
    private Long universityId;
    private String universityName;
    private String universityType;
    private LocalDateTime createdAt;
}
