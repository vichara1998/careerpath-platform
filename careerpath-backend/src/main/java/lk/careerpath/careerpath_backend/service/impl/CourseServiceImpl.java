package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.CourseCreateRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.entity.Course;
import lk.careerpath.careerpath_backend.entity.University;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lk.careerpath.careerpath_backend.repository.CourseRepository;
import lk.careerpath.careerpath_backend.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseServiceImpl {
    private final CourseRepository courseRepository;
    private final UniversityRepository universityRepository;

    public CourseResponse createCourse(CourseCreateRequest req) {
        University uni = universityRepository.findById(req.getUniversityId())
                .orElseThrow(() -> new ResourceNotFoundException("University not found: " + req.getUniversityId()));
        Course course = Course.builder()
                .title(req.getTitle()).description(req.getDescription())
                .type(req.getType()).level(req.getLevel()).mode(req.getMode())
                .feePerYear(req.getFeePerYear()).totalFee(req.getTotalFee())
                .eligibility(req.getEligibility()).durationMonths(req.getDurationMonths())
                .district(req.getDistrict()).province(req.getProvince())
                .careerFields(req.getCareerFields()).intakeDate(req.getIntakeDate())
                .applicationDeadline(req.getApplicationDeadline())
                .applicationLink(req.getApplicationLink())
                .university(uni).approved(false).build();
        return toResponse(courseRepository.save(course));
    }
    
    @Transactional(readOnly = true)
    public Page<CourseResponse> searchCourses(String keyword, CourseType type, CourseMode mode,
            String district, BigDecimal minFee, BigDecimal maxFee, String careerField, Pageable pageable) {
        return courseRepository.searchCourses(keyword, type, mode, district, maxFee, minFee, careerField, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long id) {
        return courseRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    public CourseResponse approveCourse(Long id) {
        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        c.setApproved(true);
        return toResponse(courseRepository.save(c));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getFeaturedCourses() {
        return courseRepository.findFeaturedCourses(Pageable.ofSize(6)).stream().map(this::toResponse).toList();
    }

    private CourseResponse toResponse(Course c) {
        return CourseResponse.builder()
                .id(c.getId()).title(c.getTitle()).description(c.getDescription())
                .type(c.getType()).level(c.getLevel()).mode(c.getMode())
                .feePerYear(c.getFeePerYear()).totalFee(c.getTotalFee())
                .eligibility(c.getEligibility()).durationMonths(c.getDurationMonths())
                .district(c.getDistrict()).province(c.getProvince())
                .careerFields(c.getCareerFields()).intakeDate(c.getIntakeDate())
                .applicationDeadline(c.getApplicationDeadline())
                .applicationLink(c.getApplicationLink()).brochureUrl(c.getBrochureUrl())
                .thumbnailUrl(c.getThumbnailUrl()).approved(c.getApproved())
                .averageRating(c.getAverageRating()).reviewCount(c.getReviewCount())
                .universityId(c.getUniversity().getId()).universityName(c.getUniversity().getName())
                .universityType(c.getUniversity().getType() != null ? c.getUniversity().getType().name() : null)
                .createdAt(c.getCreatedAt()).build();
    }
}

