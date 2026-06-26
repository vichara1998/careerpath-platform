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
}
