package lk.careerpath.careerpath_backend.repository;

import lk.careerpath.careerpath_backend.entity.Application;
//import lk.careerpath.careerpath_backend.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByUserId(Long userId, Pageable pageable);

    Page<Application> findByCourseId(Long courseId, Pageable pageable);

    Optional<Application> findByUserIdAndCourseId(Long userId, Long courseId);

    long countByCourseId(Long courseId);
}
