package lk.careerpath.careerpath_backend.dto.response;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class ProfileResponse {
    Long id;
    String fullName;
    String email;
    String phone;
    String role;
    String profileImageUrl;
}