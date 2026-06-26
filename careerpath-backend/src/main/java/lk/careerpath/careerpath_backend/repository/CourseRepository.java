package lk.careerpath.careerpath_backend.repository;

import lk.careerpath.careerpath_backend.entity.Course;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {

    Page<Course> findByApprovedTrue(Pageable pageable);

    @Query("SELECT c FROM Course c WHERE c.approved = true AND (:keyword IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%',:keyword,'%'))) AND (:type IS NULL OR c.type = :type) AND (:mode IS NULL OR c.mode = :mode) AND (:district IS NULL OR c.district = :district) AND (:maxFee IS NULL OR c.totalFee <= :maxFee) AND (:minFee IS NULL OR c.totalFee >= :minFee) AND (:careerField IS NULL OR c.careerFields LIKE CONCAT('%',:careerField,'%'))")
    Page<Course> searchCourses(
            @Param("keyword") String keyword,
            @Param("type") CourseType type,
            @Param("mode") CourseMode mode,
            @Param("district") String district,
            @Param("maxFee") BigDecimal maxFee,
            @Param("minFee") BigDecimal minFee,
            @Param("careerField") String careerField,
            Pageable pageable
    );

    @Query("SELECT c FROM Course c WHERE c.approved = true AND c.featured = true ORDER BY c.createdAt DESC")
    List<Course> findFeaturedCourses(Pageable pageable);
}
