package lk.careerpath.careerpath_backend.repository;

import lk.careerpath.careerpath_backend.entity.SavedCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface SavedCourseRepository extends JpaRepository<SavedCourse, Long> {

    List<SavedCourse> findByUserId(Long userId);

    Optional<SavedCourse> findByUserIdAndCourseId(Long userId, Long courseId);

    boolean existsByUserIdAndCourseId(Long userId, Long courseId);

    @Transactional
    void deleteByUserIdAndCourseId(Long userId, Long courseId);
}
