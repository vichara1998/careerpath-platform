package lk.careerpath.careerpath_backend.controller;

import jakarta.validation.Valid;
import lk.careerpath.careerpath_backend.dto.request.UpdateProfileRequest;
import lk.careerpath.careerpath_backend.dto.response.ApiResponse;
import lk.careerpath.careerpath_backend.dto.response.ProfileResponse;
import lk.careerpath.careerpath_backend.security.UserDetailsImpl;
import lk.careerpath.careerpath_backend.service.impl.ProfileServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileServiceImpl profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.getProfile(principal.getId()), "Profile loaded"));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updateProfile(principal.getId(), request), "Profile updated"));
    }

    @PostMapping(value = "/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProfileResponse>> updatePicture(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.updatePicture(principal.getId(), file), "Profile picture updated"));
    }

    @DeleteMapping("/picture")
    public ResponseEntity<ApiResponse<ProfileResponse>> deletePicture(
            @AuthenticationPrincipal UserDetailsImpl principal) {
        return ResponseEntity.ok(ApiResponse.success(
                profileService.deletePicture(principal.getId()), "Profile picture removed"));
    }
}