package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.CourseCreateRequest;
import lk.careerpath.careerpath_backend.entity.Course;
import lk.careerpath.careerpath_backend.entity.University;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lk.careerpath.careerpath_backend.enums.UniversityType;
import lk.careerpath.careerpath_backend.exception.BadRequestException;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lk.careerpath.careerpath_backend.repository.CourseRepository;
import lk.careerpath.careerpath_backend.repository.UniversityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UniversityRepository universityRepository;

    @InjectMocks
    private CourseServiceImpl courseService;

    private University university;
    private Course approvedCourse;

    @BeforeEach
    void setUp() {
        university = University.builder()
                .id(8L)
                .name("NIBM")
                .type(UniversityType.SEMI_GOVERNMENT)
                .build();
        approvedCourse = Course.builder()
                .id(20L)
                .title("Old title")
                .type(CourseType.DEGREE)
                .mode(CourseMode.PHYSICAL)
                .university(university)
                .createdByUserId(4L)
                .approved(true)
                .rejected(false)
                .featured(true)
                .build();
    }

    @Test
    void providerEditResetsApprovalAndFeaturedState() {
        when(courseRepository.findByIdAndCreatedByUserId(20L, 4L))
                .thenReturn(Optional.of(approvedCourse));
        when(universityRepository.findById(8L)).thenReturn(Optional.of(university));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        courseService.updateMyCourse(20L, 4L, request("Updated title"));

        assertEquals("Updated title", approvedCourse.getTitle());
        assertFalse(approvedCourse.getApproved());
        assertFalse(approvedCourse.getRejected());
        assertFalse(approvedCourse.getFeatured());
        verify(courseRepository).findByIdAndCreatedByUserId(20L, 4L);
    }

    @Test
    void providerCannotEditAnotherProvidersCourse() {
        when(courseRepository.findByIdAndCreatedByUserId(20L, 9L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> courseService.updateMyCourse(20L, 9L, request("Changed")));

        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    void providerCannotMoveCourseToAnotherUniversity() {
        when(courseRepository.findByIdAndCreatedByUserId(20L, 4L))
                .thenReturn(Optional.of(approvedCourse));

        CourseCreateRequest request = request("Changed");
        request.setUniversityId(9L);

        assertThrows(BadRequestException.class,
                () -> courseService.updateMyCourse(20L, 4L, request));
        verify(universityRepository, never()).findById(any());
        verify(courseRepository, never()).save(any(Course.class));
    }

    @Test
    void adminEditPreservesApprovalState() {
        when(courseRepository.findById(20L)).thenReturn(Optional.of(approvedCourse));
        when(universityRepository.findById(8L)).thenReturn(Optional.of(university));
        when(courseRepository.save(any(Course.class))).thenAnswer(invocation -> invocation.getArgument(0));

        courseService.updateCourse(20L, request("Admin update"));

        assertEquals("Admin update", approvedCourse.getTitle());
        assertTrue(approvedCourse.getApproved());
        assertTrue(approvedCourse.getFeatured());
    }

    private CourseCreateRequest request(String title) {
        CourseCreateRequest request = new CourseCreateRequest();
        request.setTitle(title);
        request.setType(CourseType.DEGREE);
        request.setMode(CourseMode.PHYSICAL);
        request.setUniversityId(8L);
        return request;
    }
}