package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.UpdateProfileRequest;
import lk.careerpath.careerpath_backend.dto.response.ProfileResponse;
import lk.careerpath.careerpath_backend.entity.User;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lk.careerpath.careerpath_backend.repository.UserRepository;
import lk.careerpath.careerpath_backend.service.ProfileImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class ProfileServiceImpl {

    private final UserRepository userRepository;
    private final ProfileImageStorageService imageStorage;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(Long userId) {
        return toResponse(findUser(userId));
    }

    public ProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findUser(userId);
        user.setFullName(request.getFullName().trim());
        String phone = request.getPhone() == null ? null : request.getPhone().trim();
        user.setPhone(phone == null || phone.isEmpty() ? null : phone);
        return toResponse(userRepository.save(user));
    }

    public ProfileResponse updatePicture(Long userId, MultipartFile image) {
        User user = findUser(userId);
        String previousImage = user.getProfileImageUrl();
        user.setProfileImageUrl(imageStorage.store(image));
        User saved = userRepository.save(user);
        imageStorage.delete(previousImage);
        return toResponse(saved);
    }

    public ProfileResponse deletePicture(Long userId) {
        User user = findUser(userId);
        String previousImage = user.getProfileImageUrl();
        user.setProfileImageUrl(null);
        User saved = userRepository.save(user);
        imageStorage.delete(previousImage);
        return toResponse(saved);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private ProfileResponse toResponse(User user) {
        return ProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName().name())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }
}