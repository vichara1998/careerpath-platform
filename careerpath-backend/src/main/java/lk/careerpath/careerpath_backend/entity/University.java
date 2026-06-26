package lk.careerpath.careerpath_backend.entity;

import jakarta.persistence.*;
import lk.careerpath.careerpath_backend.enums.UniversityType;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity @Table(name = "universities")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class University {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    private UniversityType type;

    private String province;
    private String district;
    private String website;
    private String logoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    private Boolean verified = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "university", cascade = CascadeType.ALL)
    @Builder.Default
    private Set<Course> courses = new HashSet<>();
}
