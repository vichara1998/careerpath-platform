package lk.careerpath.careerpath_backend.service.impl;

import jakarta.validation.Validation;
import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class RecommendationGuidanceTest {
    @Test void missingAiKeyStillExplainsSelectedCourseAndWarnings() {
        var course = CourseResponse.builder().id(1L).title("Computing diploma")
            .matchReasons(List.of("Matches your selected interests"))
            .matchWarnings(List.of("Exceeds your total budget")).build();
        String guidance = new AiServiceImpl().generateCareerPathwaySummary(new RecommendationRequest(), List.of(course));
        assertTrue(guidance.contains("Computing diploma"));
        assertTrue(guidance.contains("Exceeds your total budget"));
        assertTrue(guidance.contains("not admission"));
    }
    @Test void emptyCatalogueDoesNotInventCourseSuggestions() {
        String guidance = new AiServiceImpl().generateCareerPathwaySummary(new RecommendationRequest(), List.of());
        assertTrue(guidance.contains("No current approved courses match your selected fields"));
    }
    @Test void validatesQualificationModeAndPracticalLimits() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var request = new RecommendationRequest();
            request.setMaxBudget(BigDecimal.valueOf(-1));
            request.setMaxDurationMonths(0);
            request.setPreferredMode("INVALID");
            var paths = validator.validate(request).stream().map(v -> v.getPropertyPath().toString()).toList();
            assertTrue(paths.containsAll(List.of("qualificationLevel", "maxBudget", "maxDurationMonths", "preferredMode")));
            request.setQualificationLevel(QualificationLevel.AL_PASS);
            request.setMaxBudget(BigDecimal.ZERO);
            request.setMaxDurationMonths(12);
            request.setPreferredMode("ONLINE");
            assertTrue(validator.validate(request).isEmpty());
        }
    }
    @Test void validatesAllSchoolAndDegreeConflictsAndAllowsAlternativeQualifications() {
        try (var factory = Validation.buildDefaultValidatorFactory()) {
            var validator = factory.getValidator();
            var pairs = List.of(
                List.of(QualificationLevel.OL_FAIL, QualificationLevel.OL_PASS),
                List.of(QualificationLevel.AL_FAIL, QualificationLevel.AL_PASS),
                List.of(QualificationLevel.OL_FAIL, QualificationLevel.AL_PASS),
                List.of(QualificationLevel.UNDERGRADUATE, QualificationLevel.GRADUATE));
            for (var pair : pairs) {
                var request = new RecommendationRequest();
                request.setQualificationLevel(pair.getFirst());
                request.setQualifications(List.of(pair.getLast()));
                assertFalse(validator.validate(request).isEmpty(), pair.toString());
                request.setQualificationLevel(pair.getLast());
                request.setQualifications(List.of(pair.getFirst()));
                assertFalse(validator.validate(request).isEmpty(), pair.toString());
            }
            for (var school : List.of(QualificationLevel.OL_FAIL, QualificationLevel.OL_PASS, QualificationLevel.AL_FAIL, QualificationLevel.AL_PASS)) {
                for (var award : List.of(QualificationLevel.DIPLOMA, QualificationLevel.PROFESSIONAL, QualificationLevel.UNDERGRADUATE, QualificationLevel.GRADUATE)) {
                    var request = new RecommendationRequest();
                    request.setQualificationLevel(award);
                    request.setQualifications(List.of(school, award));
                    assertTrue(validator.validate(request).isEmpty(), school + " + " + award);
                }
            }
        }
    }
}
