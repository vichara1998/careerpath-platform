package lk.careerpath.careerpath_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @NotBlank
    @Size(max = 100)
    private String fullName;

    @Pattern(regexp = "^$|^[+0-9() .-]{7,20}$")
    private String phone;
}