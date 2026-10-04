package lk.careerpath.careerpath_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lk.careerpath.careerpath_backend.dto.request.CourseCreateRequest;
import lk.careerpath.careerpath_backend.dto.response.ApiResponse;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.enums.CourseType;
import lk.careerpath.careerpath_backend.service.ProfileImageStorageService;
import lk.careerpath.careerpath_backend.service.impl.CourseServiceImpl;
import lk.careerpath.careerpath_backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course management endpoints")
public class CourseController {
    private final CourseServiceImpl courseService;
    private final ProfileImageStorageService imageStorage;

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

    @GetMapping("/admin/courses/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getPendingCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.getPendingCourses(PageRequest.of(page, size, Sort.by("createdAt").descending())),
                "Pending courses fetched"));
    }

    @GetMapping("/admin/courses")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getAllCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.getAllCourses(PageRequest.of(page, size, Sort.by("createdAt").descending())),
                "All courses fetched"));
    }

    @PostMapping("/provider/courses")
    @PreAuthorize("hasAnyRole('PROVIDER','UNIVERSITY','ADMIN')")
    @Operation(summary = "Create a new course (requires PROVIDER role)")
    public ResponseEntity<ApiResponse<CourseResponse>> create(
            @Valid @RequestBody CourseCreateRequest req,
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.createCourse(req, principal.getId()), "Course submitted for approval"));
    }

    @PutMapping("/admin/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(
            @PathVariable Long id, @Valid @RequestBody CourseCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.updateCourse(id, request), "Course updated"));
    }

    @PutMapping("/provider/courses/{id}")
    @PreAuthorize("hasAnyRole('PROVIDER','UNIVERSITY')")
    public ResponseEntity<ApiResponse<CourseResponse>> updateMyCourse(
            @PathVariable Long id,
            @Valid @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.updateMyCourse(id, principal.getId(), request),
                "Course updated and submitted for approval"));
    }

    @GetMapping("/provider/courses")
    @PreAuthorize("hasAnyRole('PROVIDER','UNIVERSITY','ADMIN')")
    public ResponseEntity<ApiResponse<Page<CourseResponse>>> getMyCourses(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                courseService.getCoursesCreatedBy(principal.getId(), PageRequest.of(page, size)),
                "Your courses fetched"));
    }

    @PostMapping(value = "/provider/courses/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('PROVIDER','UNIVERSITY','ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadCourseImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(imageStorage.store(file), "Course image uploaded"));
    }

    @PatchMapping("/admin/courses/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve a course (Admin only)")
    public ResponseEntity<ApiResponse<CourseResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.approveCourse(id), "Course approved"));
    }

    @PatchMapping("/admin/courses/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(courseService.rejectCourse(id), "Course rejected"));
    }

    @DeleteMapping("/admin/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Course deleted"));
    }
}