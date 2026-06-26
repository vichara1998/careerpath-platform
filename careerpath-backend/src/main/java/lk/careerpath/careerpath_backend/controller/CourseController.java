package lk.careerpath.careerpath_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.careerpath.careerpath_backend.dto.request.CourseCreateRequest;
import lk.careerpath.careerpath_backend.dto.response.ApiResponse;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lk.careerpath.careerpath_backend.service.impl.CourseServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course management endpoints")
public class CourseController {
    private final CourseServiceImpl courseService;

    @GetMapping("/courses/public/search")
    @Operation(summary = "Search courses with filters")
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) CourseType type,
            @RequestParam(required = false) CourseMode mode,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) BigDecimal minFee,
            @RequestParam(required = false) BigDecimal maxFee,
            @RequestParam(required = false) String careerField,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return ResponseEntity.ok(ApiResponse.success(
                courseService.searchCourses(keyword, type, mode, district, minFee, maxFee, careerField, pageable),
                "Courses fetched"));
    }

    @GetMapping("/courses/public/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.getCourse(id), "Course fetched"));
    }

    @GetMapping("/courses/public/featured")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(courseService.getFeaturedCourses(), "Featured courses"));
    }

    @PostMapping("/provider/courses")
    @PreAuthorize("hasAnyRole('PROVIDER','UNIVERSITY','ADMIN')")
    @Operation(summary = "Create a new course (requires PROVIDER role)")
    public ResponseEntity<ApiResponse<CourseResponse>> create(@Valid @RequestBody CourseCreateRequest req) {
        return ResponseEntity.ok(ApiResponse.success(courseService.createCourse(req), "Course submitted for approval"));
    }

    @PatchMapping("/admin/courses/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a course (Admin only)")
    public ResponseEntity<ApiResponse<CourseResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.approveCourse(id), "Course approved"));
    }
}