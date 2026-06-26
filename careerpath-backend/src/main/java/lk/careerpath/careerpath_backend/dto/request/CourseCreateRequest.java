package lk.careerpath.careerpath_backend.dto.request;

import jakarta.validation.constraints.*;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CourseCreateRequest {
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private CourseType type;
    private String level;
    @NotNull
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
    @NotNull
    private Long universityId;
}
