package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.entity.*;
import lk.careerpath.careerpath_backend.enums.*;
import lk.careerpath.careerpath_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecommendationServiceImplTest {
    private CourseRepository courses;
    private RecommendationServiceImpl service;
    private AiServiceImpl ai;
    private RecommendationRequest request;
    @BeforeEach void setUp() {
        courses = mock(CourseRepository.class, withSettings().mockMaker("mock-maker-subclass"));
        var users = mock(UserRepository.class, withSettings().mockMaker("mock-maker-subclass"));
        var recommendations = mock(RecommendationRepository.class, withSettings().mockMaker("mock-maker-subclass"));
        ai = mock(AiServiceImpl.class, withSettings().mockMaker("mock-maker-subclass"));
        when(users.findById(1L)).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(ai.generateCareerPathwaySummary(any(), anyList())).thenReturn("Explore these options.");
        service = new RecommendationServiceImpl(courses, recommendations, users, ai);
        request = new RecommendationRequest();
        request.setQualificationLevel(QualificationLevel.AL_PASS);
        request.setInterests(List.of("Software Engineering"));
    }
    private Course course(long id, String fields) {
        return Course.builder().id(id).title("Course " + id).careerFields(fields)
            .eligibility("Open entry").type(CourseType.DEGREE).mode(CourseMode.PHYSICAL).district("Colombo")
            .totalFee(BigDecimal.valueOf(100000)).durationMonths(36).build();
    }
    @SuppressWarnings("unchecked")
    private List<CourseResponse> results(Course... catalogue) {
        when(courses.findRecommendationCandidates()).thenReturn(List.of(catalogue));
        return (List<CourseResponse>) service.getRecommendations(1L, request).get("recommendedCourses");
    }
    @Test void ranksWholeCatalogueAndGroundsAiInReturnedShortlist() {
        Course interestOnly = course(2, "software engineering");
        interestOnly.setType(CourseType.DIPLOMA);
        request.setCareerGoal("Earn a degree");
        request.setSkills(List.of("Programming"));
        var result = results(course(1, "Tourism"), interestOnly, course(3, "Software Engineering, Data Science"));
        assertEquals(3L, result.getFirst().getId());
        assertFalse(result.stream().anyMatch(c -> c.getId().equals(1L)));
        verify(ai).generateCareerPathwaySummary(eq(request), eq(result));
    }
    @Test void onlineCoursesRemainAccessibleOutsideSelectedDistrict() {
        request.setDistrict("Kandy"); request.setPreferredMode("ONLINE");
        Course online = course(1, "Software Engineering"); online.setMode(CourseMode.ONLINE);
        var result = results(online, course(2, "Software Engineering"));
        assertEquals(List.of(1L, 2L), result.stream().map(CourseResponse::getId).toList());
        assertTrue(result.getFirst().getMatchWarnings().isEmpty());
    }
    @Test void fallbackDisclosesBudgetDurationAndLocationMismatches() {
        request.setDistrict("Kandy"); request.setMaxBudget(BigDecimal.valueOf(50000)); request.setMaxDurationMonths(12);
        assertEquals(3, results(course(1, "Software Engineering")).getFirst().getMatchWarnings().size());
        assertEquals("catalogue", service.getRecommendations(1L, request).get("courseMatchType"));
    }
    @Test void missingFeesNeverCountAsAffordable() {
        request.setMaxBudget(BigDecimal.valueOf(200000));
        Course unknown = course(1, "Software Engineering"); unknown.setTotalFee(null);
        assertEquals(List.of(2L, 1L), results(unknown, course(2, "Software Engineering")).stream().map(CourseResponse::getId).toList());
    }
    @Test void distinguishesBridgingAndComplexRequirementsWithoutAdmissionGuarantees() {
        request.setQualificationLevel(QualificationLevel.OL_PASS);
        Course advanced = course(1, "Software Engineering"); advanced.setEligibility("A/L pass");
        assertTrue(results(advanced).isEmpty());
        advanced.setEligibility("A/L pass or equivalent with interview");
        assertTrue(results(advanced).isEmpty());
        advanced.setEligibility("O/L pass");
        assertEquals("MEETS_LISTED_REQUIREMENT", results(advanced).getFirst().getEligibilityStatus());
    }
    @Test void normalizesWholeTagsWithoutSubstringFalseMatches() {
        request.setInterests(List.of("Data")); request.setQualificationLevel(QualificationLevel.OL_FAIL);
        assertTrue(results(course(1, "Data Science")).isEmpty());
        request.setInterests(List.of("  SOFTWARE engineering "));
        assertEquals(40, results(course(1, "Software Engineering, Business")).getFirst().getMatchScore());
    }
    @Test void excludesExpiredCoursesAndUsesStableTies() {
        Course expired = course(1, "Software Engineering");
        expired.setApplicationDeadline(LocalDate.now(java.time.ZoneId.of("Asia/Colombo")).minusDays(1));
        assertEquals(List.of(2L, 3L), results(course(3, "Software Engineering"), expired,
            course(2, "Software Engineering")).stream().map(CourseResponse::getId).toList());
        assertTrue(results().isEmpty());
    }
    @Test void scoresStayWithinRangeAndLimitsResultsAfterRanking() {
        request.setCareerGoal("Earn a degree"); request.setSkills(List.of("Programming"));
        request.setPreferredMode("PHYSICAL"); request.setDistrict("Colombo");
        request.setMaxBudget(BigDecimal.valueOf(100000)); request.setMaxDurationMonths(36);
        var result = results(java.util.stream.LongStream.rangeClosed(1, 20)
            .mapToObj(i -> course(i, "Software Engineering")).toArray(Course[]::new));
        assertEquals(20, result.size()); assertEquals(100, result.getFirst().getMatchScore());
    }
    @Test void agricultureNeverFallsBackToNetworkingEvenWithConflictingStreamSkillsAndGoals() {
        request.setInterests(List.of("Agriculture"));
        request.setStream("Technology");
        request.setSkills(List.of("Programming"));
        request.setCareerGoal("Earn a degree");
        request.setMaxBudget(BigDecimal.valueOf(1000));
        var result = results(course(1, "Networking"), course(2, "Agriculture"));
        assertEquals(List.of(2L), result.stream().map(CourseResponse::getId).toList());
        assertFalse(result.getFirst().getMatchWarnings().isEmpty());
        var response = service.getRecommendations(1L, request);
        assertEquals(List.of("Agriculture"), response.get("careerFields"));
        assertEquals("catalogue", response.get("courseMatchType"));
    }
    @Test void missingAgricultureCoursesReturnEmptyInsteadOfUnrelatedAlternatives() {
        request.setInterests(List.of("Agriculture"));
        request.setStream("Technology");
        assertTrue(results(course(1, "Networking"), course(2, "Business")).isEmpty());
        assertEquals("none", service.getRecommendations(1L, request).get("courseMatchType"));
        verifyNoInteractions(ai);
    }
    @Test void multipleSelectedFieldsAllowOnlyThoseFields() {
        request.setInterests(List.of(" Agriculture ", "Tourism"));
        assertEquals(List.of(1L, 2L), results(course(3, "Networking"), course(2, "Tourism"),
            course(1, "AGRICULTURE, Food Technology")).stream().map(CourseResponse::getId).toList());
    }
    @Test void streamFieldsConstrainResultsWhenNoInterestsAreSelected() {
        request.setInterests(List.of()); request.setStream("BioTechnology");
        request.setMaxBudget(BigDecimal.ZERO);
        assertEquals(List.of(2L), results(course(1, "Networking"), course(2, "Agriculture"))
            .stream().map(CourseResponse::getId).toList());
    }
    @Test void advancedStudyStreamsConstrainCoursesWithoutExplicitInterests() {
        request.setQualificationLevel(QualificationLevel.GRADUATE);
        request.setInterests(List.of());
        request.setStream("Agriculture");
        assertEquals(List.of(2L), results(course(1, "Networking"), course(2, "Agriculture"))
            .stream().map(CourseResponse::getId).toList());
        request.setStream("Computing");
        assertEquals(List.of(1L), results(course(1, "Networking"), course(2, "Agriculture"))
            .stream().map(CourseResponse::getId).toList());
    }
    @Test void eligibilityUsesAllSelectedQualificationsInsteadOfOnlyThePrimaryLabel() {
        request.setQualificationLevel(QualificationLevel.DIPLOMA);
        request.setQualifications(List.of(QualificationLevel.AL_PASS, QualificationLevel.DIPLOMA));
        Course course = course(1, "Software Engineering");
        course.setEligibility("A/L pass");
        assertEquals("MEETS_LISTED_REQUIREMENT", results(course).getFirst().getEligibilityStatus());
        request.setQualificationLevel(QualificationLevel.PROFESSIONAL);
        request.setQualifications(List.of(QualificationLevel.GRADUATE, QualificationLevel.PROFESSIONAL));
        course.setEligibility("Bachelor degree");
        assertEquals("MEETS_LISTED_REQUIREMENT", results(course).getFirst().getEligibilityStatus());
        request.setQualifications(List.of(QualificationLevel.OL_PASS));
        assertTrue(results(course).isEmpty());
    }
    @Test void schoolFailureDoesNotExcludeDiplomaCoursesOrPretendADiplomaIsAlreadyHeld() {
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        Course diploma = course(1, "Software Engineering");
        diploma.setType(CourseType.DIPLOMA);
        diploma.setEligibility("Open entry; contact provider");
        assertEquals("OPEN_ENTRY", results(diploma).getFirst().getEligibilityStatus());
        request.setQualifications(List.of(QualificationLevel.OL_FAIL, QualificationLevel.DIPLOMA));
        diploma.setEligibility("A/L pass");
        assertTrue(results(diploma).isEmpty());
    }
    @Test void undergraduateStatusDoesNotImplyACompletedDegreeOrALPass() {
        request.setQualificationLevel(QualificationLevel.UNDERGRADUATE);
        Course course = course(1, "Software Engineering");
        course.setEligibility("Bachelor degree");
        assertTrue(results(course).isEmpty());
        request.setQualifications(List.of(QualificationLevel.OL_FAIL, QualificationLevel.UNDERGRADUATE));
        course.setEligibility("A/L pass");
        assertTrue(results(course).isEmpty());
    }
    @Test void inconsistentProfilesAreRejectedBeforeMatching() {
        request.setQualificationLevel(QualificationLevel.AL_PASS);
        request.setQualifications(List.of(QualificationLevel.OL_FAIL));
        assertThrows(lk.careerpath.careerpath_backend.exception.BadRequestException.class,
            () -> service.getRecommendations(1L, request));
        verifyNoInteractions(courses);
    }
    @Test void olIncompleteNeverGetsNetworkingWithUnmetOrUnknownEntryRulesEvenAsFallback() {
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        request.setInterests(List.of("Networking"));
        request.setStream("Vocational");
        request.setCareerGoal("Earn a degree");
        request.setPreferredMode("PHYSICAL");
        request.setDistrict("Colombo");
        for (String entry : Arrays.asList("O/L pass", "A/L pass", "O/L Pass. Basic IT knowledge.",
                "A/L Pass or O/L Pass with relevant experience.", "3'S", "", null)) {
            Course networking = course(1, "Networking");
            networking.setEligibility(entry);
            assertTrue(results(networking).isEmpty(), "Must not recommend with entry requirements: " + entry);
        }
        verifyNoInteractions(ai);
    }
    @Test void noInterestOrStreamDoesNotReturnArbitraryCatalogueCourses() {
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        request.setInterests(List.of());
        request.setStream(null);
        request.setCareerGoal("Earn a degree");
        assertTrue(results(course(1, "Networking")).isEmpty());
        assertEquals("SELECT_FIELD", service.getRecommendations(1L, request).get("emptyReason"));
    }
    @Test void validOpenEntryDiplomaSurvivesWithoutReintroducingIneligibleNetworkCourse() {
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        request.setInterests(List.of("Agriculture"));
        Course network = course(1, "Networking"); network.setEligibility("A/L pass");
        Course diploma = course(2, "Agriculture"); diploma.setType(CourseType.DIPLOMA);
        diploma.setEligibility("No formal qualifications required");
        assertEquals(List.of(2L), results(network, diploma).stream().map(CourseResponse::getId).toList());
    }
    @Test void unknownRequirementsHaveAnHonestEmptyMessageInsteadOfRecommendedCards() {
        Course unknown = course(1, "Software Engineering"); unknown.setEligibility(null);
        assertTrue(results(unknown).isEmpty());
        var response = service.getRecommendations(1L, request);
        assertEquals("ENTRY_REQUIREMENTS_UNVERIFIED", response.get("emptyReason"));
        assertTrue(response.get("emptyMessage").toString().contains("unclear entry requirements"));
    }
    @Test void wayambaNetworkL11WithALLevelAndThreeSPassesIsNeverRecommendedForOLPass() {
        request.setQualificationLevel(QualificationLevel.OL_PASS);
        request.setQualifications(List.of(QualificationLevel.OL_PASS));
        request.setInterests(List.of("Networking"));
        Course network = course(11, "Networking");
        network.setTitle("Network l11");
        network.setUniversity(University.builder().name("Wayamba University").build());
        network.setDistrict("Badulla");
        network.setDurationMonths(48);
        network.setLevel("A/L");
        network.setEligibility("3'S");
        network.setApplicationDeadline(null);
        assertTrue(results(network).isEmpty());
        var response = service.getRecommendations(1L, request);
        assertEquals("none", response.get("courseMatchType"));
        assertEquals("NO_ELIGIBLE_COURSES", response.get("emptyReason"));
        verifyNoInteractions(ai);
    }
    @Test void aSchoolEntryStageCannotBeBypassedByAnOpenEntryLabel() {
        request.setQualificationLevel(QualificationLevel.OL_PASS);
        Course course = course(1, "Software Engineering");
        course.setLevel("A/L");
        course.setEligibility("Open entry");
        assertTrue(results(course).isEmpty());
        request.setQualificationLevel(QualificationLevel.PROFESSIONAL);
        assertTrue(results(course).isEmpty());
    }
    @SuppressWarnings("unchecked")
    @Test void olFailAgricultureHasEligibleSameFieldAndSeparateOtherFieldOptions() {
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        request.setInterests(List.of("Agriculture"));
        Course agriculture = course(1, "Agriculture"); agriculture.setType(CourseType.DIPLOMA);
        Course cookery = course(2, "Tourism"); cookery.setType(CourseType.CERTIFICATE);
        Course network = course(3, "Networking"); network.setLevel("A/L"); network.setEligibility("3'S");
        results(agriculture, cookery, network);
        var response = service.getRecommendations(1L, request);
        assertEquals(List.of(1L), ((List<CourseResponse>) response.get("recommendedCourses")).stream().map(CourseResponse::getId).toList());
        assertEquals(List.of(2L), ((List<CourseResponse>) response.get("alternativeCourses")).stream().map(CourseResponse::getId).toList());
        agriculture.setEligibility("A/L pass");
        assertTrue(results(agriculture, cookery, network).isEmpty());
        response = service.getRecommendations(1L, request);
        assertEquals(List.of(2L), ((List<CourseResponse>) response.get("alternativeCourses")).stream().map(CourseResponse::getId).toList());
        assertTrue(response.get("emptyMessage").toString().contains("not available now"));
    }
    @Test void gradeAndAgeMatchVocationalRoutesWithoutClaimingAnOLPass() {
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        request.setHighestSchoolGrade(9); request.setAge(17);
        Course vocational = course(1, "Software Engineering");
        vocational.setEligibility("Grade 9 or above. Age 16+.");
        assertEquals("CONDITIONAL_MATCH", results(vocational).getFirst().getEligibilityStatus());
        request.setAge(15); assertTrue(results(vocational).isEmpty());
        request.setAge(17); request.setHighestSchoolGrade(8); assertTrue(results(vocational).isEmpty());
    }
    @Test void alFailAndAlPassGetDifferentCoursesBasedOnActualEntryRoutes() {
        Course olCourse = course(1, "Software Engineering"); olCourse.setEligibility("O/L pass");
        Course alCourse = course(2, "Software Engineering"); alCourse.setEligibility("A/L Pass with Mathematics and 3 S passes");
        request.setQualificationLevel(QualificationLevel.AL_FAIL);
        assertEquals(List.of(1L), results(olCourse, alCourse).stream().map(CourseResponse::getId).toList());
        request.setQualificationLevel(QualificationLevel.AL_PASS);
        assertEquals(2, results(olCourse, alCourse).size());
        alCourse.setEligibility("A/L Pass or O/L Pass with relevant experience");
        request.setQualificationLevel(QualificationLevel.OL_PASS);
        assertEquals("CONDITIONAL_MATCH", results(alCourse).getFirst().getEligibilityStatus());
    }
}
