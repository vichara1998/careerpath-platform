package lk.careerpath.careerpath_backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl {
    private final JavaMailSender mailSender;
    @Value("${app.mail.from}")
    private String fromEmail;
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendVerificationEmail(String to, String name, String token) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject("Verify your CareerPath Sri Lanka account");
            msg.setText("Hi " + name + ",\n\nVerify your email:\n" +
                    frontendUrl + "/verify-email?token=" + token +
                    "\n\nLink expires in 24 hours.\n\n— CareerPath Sri Lanka Team");
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String name, String token) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject("Reset your CareerPath Sri Lanka password");
            msg.setText("Hi " + name + ",\n\nReset your password:\n" +
                    frontendUrl + "/reset-password?token=" + token +
                    "\n\nLink expires in 30 minutes.\n\n— CareerPath Sri Lanka Team");
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send reset email to {}: {}", to, e.getMessage());
        }
    }

    @Async
    public void sendApplicationStatusEmail(String to, String name, String courseName, String status) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject("Application update: " + courseName);
            msg.setText("Hi " + name + ",\n\nYour application for '" + courseName + "' has been updated to: " + status +
                    "\n\nLog in to view details: " + frontendUrl + "/dashboard" +
                    "\n\n— CareerPath Sri Lanka Team");
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Email error: {}", e.getMessage());
        }
    }
}
