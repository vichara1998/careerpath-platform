package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.CourseCreateRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.entity.Course;
import lk.careerpath.careerpath_backend.entity.University;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lk.careerpath.careerpath_backend.exception.BadRequestException;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lk.careerpath.careerpath_backend.repository.CourseRepository;
import lk.careerpath.careerpath_backend.repository.UniversityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseServiceImpl {
    private final CourseRepository courseRepository;
    private final UniversityRepository universityRepository;

    public CourseResponse createCourse(CourseCreateRequest req, Long creatorId) {
        Course course = new Course();
        applyCourseRequest(course, req);
        course.setCreatedByUserId(creatorId);
        course.setApproved(false);
        course.setRejected(false);
        return toResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(Long id, CourseCreateRequest req) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        applyCourseRequest(course, req);
        return toResponse(courseRepository.save(course));
    }

    public CourseResponse updateMyCourse(Long id, Long creatorId, CourseCreateRequest req) {
        Course course = courseRepository.findByIdAndCreatedByUserId(id, creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getUniversity().getId().equals(req.getUniversityId())) {
            throw new BadRequestException("Only an administrator can change a course's university");
        }
        applyCourseRequest(course, req);
        course.setApproved(false);
        course.setRejected(false);
        course.setFeatured(false);
        return toResponse(courseRepository.save(course));
    }

    private void applyCourseRequest(Course course, CourseCreateRequest request) {
        University university = universityRepository.findById(request.getUniversityId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "University not found: " + request.getUniversityId()));
        course.setTitle(request.getTitle().trim());
        course.setDescription(request.getDescription());
        course.setType(request.getType());
        course.setLevel(request.getLevel());
        course.setMode(request.getMode());
        course.setFeePerYear(request.getFeePerYear());
        course.setTotalFee(request.getTotalFee());
        course.setEligibility(request.getEligibility());
        course.setDurationMonths(request.getDurationMonths());
        course.setDistrict(request.getDistrict());
        course.setProvince(request.getProvince());
        course.setCareerFields(request.getCareerFields());
        course.setIntakeDate(request.getIntakeDate());
        course.setApplicationDeadline(request.getApplicationDeadline());
        course.setApplicationLink(request.getApplicationLink());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setUniversity(university);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getCoursesCreatedBy(Long userId, Pageable pageable) {
        return courseRepository.findByCreatedByUserId(userId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> searchCourses(String keyword, CourseType type, CourseMode mode,
            String district, BigDecimal minFee, BigDecimal maxFee, String careerField, Pageable pageable) {
        return courseRepository.searchCourses(keyword, type, mode, district, maxFee, minFee, careerField, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getPendingCourses(Pageable pageable) {
        return courseRepository.findPendingCourses(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAllCourses(Pageable pageable) {
        return courseRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<CourseResponse> getAdminCourses(String keyword, String status, CourseType type,
            String district, Pageable pageable) {
        return courseRepository.findAll(adminFilter(keyword, status, type, district), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getAdminCourseSummary() {
        return Map.of("total", courseRepository.count(),
                "published", courseRepository.count(adminFilter(null, "published", null, null)),
                "pending", courseRepository.count(adminFilter(null, "pending", null, null)),
                "rejected", courseRepository.count(adminFilter(null, "rejected", null, null)));
    }

    private Specification<Course> adminFilter(String keyword, String status, CourseType type, String district) {
        String state = status == null ? "all" : status.toLowerCase(Locale.ROOT);
        if (!List.of("all", "published", "pending", "rejected").contains(state))
            throw new BadRequestException("Unknown course status");
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase(Locale.ROOT)
                        .replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_") + "%";
                predicates.add(cb.or(cb.like(cb.lower(root.get("title")), pattern, '\\'),
                        cb.like(cb.lower(root.get("university").get("name")), pattern, '\\')));
            }
            if (type != null) predicates.add(cb.equal(root.get("type"), type));
            if (district != null && !district.isBlank()) predicates.add(cb.equal(root.get("district"), district));
            if (state.equals("published")) predicates.add(cb.isTrue(root.get("approved")));
            if (state.equals("rejected")) predicates.add(cb.isTrue(root.get("rejected")));
            if (state.equals("pending")) {
                predicates.add(cb.or(cb.isFalse(root.get("approved")), cb.isNull(root.get("approved"))));
                predicates.add(cb.or(cb.isFalse(root.get("rejected")), cb.isNull(root.get("rejected"))));
            }
            return cb.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourse(Long id) {
        return courseRepository.findById(id)
                .filter(course -> Boolean.TRUE.equals(course.getApproved())
                        && !Boolean.TRUE.equals(course.getRejected()))
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    public CourseResponse approveCourse(Long id) {
        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        c.setApproved(true);
        c.setRejected(false);
        return toResponse(courseRepository.save(c));
    }

    public CourseResponse rejectCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        course.setApproved(false);
        course.setRejected(true);
        return toResponse(courseRepository.save(course));
    }

    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
        courseRepository.delete(course);
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
                .thumbnailUrl(c.getThumbnailUrl()).approved(c.getApproved()).rejected(c.getRejected())
                .averageRating(c.getAverageRating()).reviewCount(c.getReviewCount())
                .universityId(c.getUniversity().getId()).universityName(c.getUniversity().getName())
                .universityType(c.getUniversity().getType() != null ? c.getUniversity().getType().name() : null)
                .createdAt(c.getCreatedAt()).build();
    }
}
