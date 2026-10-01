package lk.careerpath.careerpath_backend.dto.response;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class AdminUserResponse {
    Long id;
    String fullName;
    String email;
    String role;
    Boolean emailVerified;
    String status;
    LocalDateTime createdAt;
}
