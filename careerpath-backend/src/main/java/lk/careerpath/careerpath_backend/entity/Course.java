package lk.careerpath.careerpath_backend.entity;

import jakarta.persistence.*;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "courses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "university_id", nullable = false)
    private University university;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseType type;

    @Column(length = 100)
    private String level; // BSc, HND, NVQ Level 4, etc.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CourseMode mode = CourseMode.PHYSICAL;

    private BigDecimal feePerYear;
    private BigDecimal totalFee;

    @Column(length = 200)
    private String eligibility;

    private Integer durationMonths;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String province;

    private String brochureUrl;
    private String thumbnailUrl;
    private String applicationLink;

    @Column(length = 200)
    private String careerFields; // CSV: "Software Engineering,Data Science"

    private LocalDate intakeDate;
    private LocalDate applicationDeadline;

    @Builder.Default
    private Boolean approved = false;

    @Builder.Default
    private Boolean featured = false;

    private Double averageRating;
    private Integer reviewCount;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Review> reviews = new HashSet<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Application> applications = new HashSet<>();
}
