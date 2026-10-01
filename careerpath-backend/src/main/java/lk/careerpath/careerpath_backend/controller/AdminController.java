package lk.careerpath.careerpath_backend.controller;

import lk.careerpath.careerpath_backend.dto.response.AdminUserResponse;
import lk.careerpath.careerpath_backend.dto.response.ApiResponse;
import lk.careerpath.careerpath_backend.entity.User;
import lk.careerpath.careerpath_backend.repository.UserRepository;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getUsers() {
        List<AdminUserResponse> users = userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(users, "Users fetched"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted"));
    }

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .emailVerified(user.getEmailVerified())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
