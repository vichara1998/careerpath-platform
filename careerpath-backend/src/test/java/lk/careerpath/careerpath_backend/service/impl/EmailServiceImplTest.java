package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.exception.EmailDeliveryException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailServiceImplTest {
    private JavaMailSender sender;
    private EmailServiceImpl service;

    @BeforeEach
    void setUp() {
        sender = mock(JavaMailSender.class);
        service = new EmailServiceImpl(sender);
        ReflectionTestUtils.setField(service, "fromEmail", "verified@example.com");
        ReflectionTestUtils.setField(service, "frontendUrl", "https://careerpath.example.com");
    }

    @Test
    void resetEmailUsesConfiguredSenderAndFrontendLink() {
        service.sendPasswordResetEmail("student@example.com", "Student", "reset-token");
        var message = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(message.capture());
        assertEquals("verified@example.com", message.getValue().getFrom());
        assertArrayEquals(new String[]{"student@example.com"}, message.getValue().getTo());
        assertTrue(message.getValue().getText().contains("https://careerpath.example.com/reset-password?token=reset-token"));
    }

    @Test
    void failedAuthEmailsDoNotReportSuccess() {
        doThrow(new MailSendException("SMTP rejected delivery")).when(sender).send(any(SimpleMailMessage.class));
        assertThrows(EmailDeliveryException.class,
                () -> service.sendPasswordResetEmail("student@example.com", "Student", "token"));
        assertThrows(EmailDeliveryException.class,
                () -> service.sendVerificationEmail("student@example.com", "Student", "token"));
    }
}
