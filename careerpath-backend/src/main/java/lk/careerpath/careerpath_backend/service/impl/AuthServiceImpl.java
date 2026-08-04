package lk.careerpath.careerpath_backend.service.impl;
import lk.careerpath.careerpath_backend.dto.request.LoginRequest;
import lk.careerpath.careerpath_backend.dto.request.RegisterRequest;
import lk.careerpath.careerpath_backend.dto.response.AuthResponse;
import lk.careerpath.careerpath_backend.entity.*;
import lk.careerpath.careerpath_backend.enums.RoleName;
import lk.careerpath.careerpath_backend.exception.*;
import lk.careerpath.careerpath_backend.repository.*;
import lk.careerpath.careerpath_backend.security.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service @RequiredArgsConstructor @Slf4j @Transactional
public class AuthServiceImpl {
    private final UserRepository     userRepo;
    private final RoleRepository     roleRepo;
    private final PasswordEncoder    encoder;
    private final JwtTokenProvider   jwt;
    private final AuthenticationManager authManager;
    private final EmailServiceImpl   emailService;
    private final NotificationRepository notifRepo;

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new BadRequestException("Email already registered: " + req.getEmail());

        RoleName roleName = switch (req.getRole().toUpperCase()) {
            case "PROVIDER"    -> RoleName.ROLE_PROVIDER;
            case "UNIVERSITY"  -> RoleName.ROLE_UNIVERSITY;
            default            -> RoleName.ROLE_STUDENT;
        };
        Role role = roleRepo.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        String token = UUID.randomUUID().toString();
        User user = User.builder()
                .fullName(req.getFullName()).email(req.getEmail())
                .passwordHash(encoder.encode(req.getPassword()))
                .role(role).phone(req.getPhone())
                .emailVerificationToken(token)
                .emailVerificationExpiry(LocalDateTime.now().plusHours(24))
                .emailVerified(false).build();
        userRepo.save(user);

        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);
        log.info("Registered user: {}", user.getEmail());
        return AuthResponse.builder().message("Registration successful. Please check your email to verify your account.").build();
    }

    public AuthResponse login(LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .accessToken(jwt.generateToken(ud))
                .refreshToken(jwt.generateRefreshToken(ud))
                .tokenType("Bearer")
                .userId(ud.getId())
                .email(ud.getUsername())
                .fullName(user.getFullName())
                .role(ud.getAuthorities().iterator().next().getAuthority())
                .build();
    }

    public void verifyEmail(String token) {
        User user = userRepo.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));
        if (user.getEmailVerificationExpiry().isBefore(LocalDateTime.now()))
            throw new BadRequestException("Verification token has expired");
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiry(null);
        userRepo.save(user);

        // welcome notification
        Notification n = Notification.builder().user(user).type("WELCOME")
                .message("Welcome to CareerPath Sri Lanka! Start exploring courses.").link("/recommendation").build();
        notifRepo.save(n);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
    }

    public void requestPasswordReset(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No account with email: " + email));
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpiry(LocalDateTime.now().plusMinutes(30));
        userRepo.save(user);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), token);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepo.findByPasswordResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getPasswordResetExpiry().isBefore(LocalDateTime.now()))
            throw new BadRequestException("Reset token has expired");
        user.setPasswordHash(encoder.encode(newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);
        userRepo.save(user);
    }
}