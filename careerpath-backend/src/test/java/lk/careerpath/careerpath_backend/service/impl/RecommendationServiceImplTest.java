package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.entity.*;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class RecommendationServiceImplTest {
    private CourseRepository courses;
    private RecommendationServiceImpl service;

    @BeforeEach
    void setUp() {
        courses = mock(CourseRepository.class, withSettings().mockMaker("mock-maker-subclass"));
        var users = mock(UserRepository.class, withSettings().mockMaker("mock-maker-subclass"));
        var recommendations = mock(RecommendationRepository.class, withSettings().mockMaker("mock-maker-subclass"));
        var ai = mock(AiServiceImpl.class, withSettings().mockMaker("mock-maker-subclass"));
        when(users.findById(1L)).thenReturn(Optional.of(User.builder().id(1L).build()));
        when(ai.generateCareerPathwaySummary(any())).thenReturn("Explore these options.");
        service = new RecommendationServiceImpl(courses, recommendations, users, ai);
    }

    @Test
    void anyDistrictAndModeDoNotFilterOutCoursesAndResultsAreUnique() {
        var university = University.builder().name("Test university").build();
        var course = Course.builder().id(20L).title("Software Engineering").university(university).build();
        when(courses.searchCourses(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(course)));
        var request = new RecommendationRequest();
        request.setInterests(List.of("Software Engineering", "Data Science", "Cybersecurity", "AI/ML"));
        request.setDistrict("");
        request.setPreferredMode("");

        var result = service.getRecommendations(1L, request);

        assertEquals(1, ((List<?>) result.get("recommendedCourses")).size());
        verify(courses).searchCourses(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), eq("AI/ML"), any(Pageable.class));
        verify(courses, times(4)).searchCourses(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), anyString(), any(Pageable.class));
    }

    @Test
    void noExactMatchReturnsClearlyLabelledPublishedAlternatives() {
        when(courses.searchCourses(isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));
        var alternative = Course.builder().id(30L).title("Business diploma")
                .university(University.builder().name("Test university").build()).build();
        when(courses.findByApprovedTrue(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(alternative)));
        var request = new RecommendationRequest();
        request.setInterests(List.of("Education"));
        var result = service.getRecommendations(1L, request);
        assertEquals("catalogue", result.get("courseMatchType"));
        assertEquals(1, ((List<?>) result.get("recommendedCourses")).size());
    }

    @Test
    void selectedDistrictAndModeAreRespected() {
        when(courses.findByApprovedTrue(any(Pageable.class))).thenReturn(new PageImpl<>(List.of()));
        when(courses.searchCourses(isNull(), isNull(), eq(CourseMode.ONLINE), eq("Kandy"), isNull(), isNull(), anyString(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));
        var request = new RecommendationRequest();
        request.setInterests(List.of("Engineering"));
        request.setDistrict("Kandy");
        request.setPreferredMode("ONLINE");
        assertTrue(((List<?>) service.getRecommendations(1L, request).get("recommendedCourses")).isEmpty());
        verify(courses).searchCourses(isNull(), isNull(), eq(CourseMode.ONLINE), eq("Kandy"), isNull(), isNull(), eq("Engineering"), any(Pageable.class));
    }
}
