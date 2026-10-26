package lk.careerpath.careerpath_backend.controller;

import lk.careerpath.careerpath_backend.enums.CourseType;
import lk.careerpath.careerpath_backend.service.ProfileImageStorageService;
import lk.careerpath.careerpath_backend.service.impl.CourseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Map;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AdminCourseControllerTest {
    private CourseServiceImpl service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(CourseServiceImpl.class, withSettings().mockMaker("mock-maker-subclass"));
        mvc = MockMvcBuilders.standaloneSetup(new CourseController(service, mock(ProfileImageStorageService.class,
                withSettings().mockMaker("mock-maker-subclass"))))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void filtersAndPaginationReachService() throws Exception {
        var pageable = PageRequest.of(2, 10, Sort.by("createdAt", "id").descending());
        when(service.getAdminCourses("engineering", "pending", CourseType.DEGREE, "Kandy", pageable))
                .thenReturn(Page.empty(pageable));
        mvc.perform(get("/api/v1/admin/courses").param("keyword", "engineering").param("status", "pending")
                .param("type", "DEGREE").param("district", "Kandy").param("page", "2").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.number").value(2));
        verify(service).getAdminCourses("engineering", "pending", CourseType.DEGREE, "Kandy", pageable);
    }

    @Test
    void invalidPaginationIsRejected() throws Exception {
        mvc.perform(get("/api/v1/admin/courses").param("page", "-1")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/admin/courses").param("size", "0")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/admin/courses").param("size", "101")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void summaryReturnsGlobalCounts() throws Exception {
        when(service.getAdminCourseSummary()).thenReturn(Map.of("total", 80L, "pending", 4L, "published", 75L, "rejected", 1L));
        mvc.perform(get("/api/v1/admin/courses/summary"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.total").value(80))
                .andExpect(jsonPath("$.data.pending").value(4));
    }
}
