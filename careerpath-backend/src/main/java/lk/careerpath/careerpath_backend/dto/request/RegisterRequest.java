package lk.careerpath.careerpath_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    @Size(min = 8, max = 50)
    private String password;
    @NotBlank
    private String role; // STUDENT, PROVIDER, UNIVERSITY
    private String phone;
}