package lk.careerpath.careerpath_backend.entity;

import jakarta.persistence.*;
import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import lombok.*;

@Entity @Table(name = "qualifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Qualification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private QualificationLevel level;

    private String stream;
    private String examType;
    private String gpa;
    private String interests;
    private String skills;
    private String careerGoals;
}