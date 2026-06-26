package lk.careerpath.careerpath_backend.repository;

import lk.careerpath.careerpath_backend.entity.University;
import lk.careerpath.careerpath_backend.enums.UniversityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UniversityRepository extends JpaRepository<University, Long> {

    Page<University> findByVerifiedTrue(Pageable pageable);

    List<University> findByType(UniversityType type);
}