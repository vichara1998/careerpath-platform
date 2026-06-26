package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.entity.Recommendation;
import lk.careerpath.careerpath_backend.entity.User;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lk.careerpath.careerpath_backend.repository.CourseRepository;
import lk.careerpath.careerpath_backend.repository.RecommendationRepository;
import lk.careerpath.careerpath_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RecommendationServiceImpl {
    private final CourseRepository courseRepository;
    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final AiServiceImpl aiService;

    public Map<String, Object> getRecommendations(Long userId, RecommendationRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Determine eligible career fields from qualification level + stream
        List<String> careerFields = determineCareerFields(req);

        // Fetch relevant courses
        List<CourseResponse> courses = new ArrayList<>();
        for (String field : careerFields.stream().limit(3).toList()) {
            CourseMode mode = req.getPreferredMode() != null ? CourseMode.valueOf(req.getPreferredMode()) : null;
            courseRepository.searchCourses(null, null, mode,
                    req.getDistrict(), null, null, field,
                    PageRequest.of(0, 5))
                    .forEach(c -> courses.add(toSimpleResponse(c)));
        }

        // Get AI-generated pathway summary
        String aiSummary = aiService.generateCareerPathwaySummary(req);

        // Save recommendation
        Recommendation rec = Recommendation.builder()
                .user(user)
                .careerField(String.join(", ", careerFields.stream().limit(3).toList()))
                .pathwaySummary(aiSummary)
                .build();
        recommendationRepository.save(rec);

        return Map.of(
                "careerFields", careerFields,
                "pathwaySummary", aiSummary,
                "recommendedCourses", courses);
    }

    private List<String> determineCareerFields(RecommendationRequest req) {
        List<String> fields = new ArrayList<>();
        QualificationLevel level = req.getQualificationLevel();

        if (req.getInterests() != null)
            fields.addAll(req.getInterests());

        if (level == null)
            return fields;

        switch (level) {
            case OL_FAIL -> fields.addAll(List.of("NVQ Vocational", "Short Courses", "ICT Fundamentals"));
            case OL_PASS -> {
                if ("Science".equalsIgnoreCase(req.getStream()))
                    fields.addAll(List.of("Software Engineering", "Data Science", "Engineering"));
                else if ("Commerce".equalsIgnoreCase(req.getStream()))
                    fields.addAll(List.of("Business", "Accounting", "Marketing"));
                else if ("Arts".equalsIgnoreCase(req.getStream()))
                    fields.addAll(List.of("Arts & Design", "Media Studies", "Tourism"));
                else
                    fields.addAll(List.of("ICT", "Business", "Networking"));
            }
            case AL_FAIL -> fields.addAll(List.of("Diploma", "NVQ Level 4/5", "Online Certifications"));
            case AL_PASS -> {
                if ("Bio".equalsIgnoreCase(req.getStream()))
                    fields.addAll(List.of("Medicine", "Nursing", "Agriculture"));
                else if ("Maths".equalsIgnoreCase(req.getStream()) || "Technology".equalsIgnoreCase(req.getStream()))
                    fields.addAll(List.of("Software Engineering", "Cybersecurity", "Data Science", "AI/ML"));
                else if ("Commerce".equalsIgnoreCase(req.getStream()))
                    fields.addAll(List.of("Business", "Finance", "Accounting", "Marketing"));
                else
                    fields.addAll(List.of("Arts & Design", "Media Studies", "Tourism", "Psychology"));
            }
            case GRADUATE, POSTGRADUATE ->
                fields.addAll(List.of("Postgraduate", "Professional Certification", "AI/ML", "Cybersecurity"));
            default -> fields.addAll(List.of("Business", "Software Engineering", "Data Science"));
        }
        return fields.stream().distinct().toList();
    }

    private CourseResponse toSimpleResponse(lk.careerpath.entity.Course c) {
        return CourseResponse.builder()
                .id(c.getId()).title(c.getTitle()).type(c.getType()).level(c.getLevel())
                .mode(c.getMode()).totalFee(c.getTotalFee()).district(c.getDistrict())
                .universityName(c.getUniversity().getName())
                .averageRating(c.getAverageRating()).build();
    }
}
