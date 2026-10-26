package lk.careerpath.careerpath_backend.controller;

import lk.careerpath.careerpath_backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest {
    private AuthServiceImpl service;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        service = mock(AuthServiceImpl.class, withSettings().mockMaker("mock-maker-subclass"));
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void invalidResetRequestsAreRejectedBeforeCallingService() throws Exception {
        for (String password : new String[]{"", "short", " ".repeat(8), "a".repeat(51)}) {
            mvc.perform(post("/api/v1/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"token\":\"valid-token\",\"newPassword\":\"" + password + "\"}"))
                    .andExpect(status().isBadRequest());
        }
        mvc.perform(post("/api/v1/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"newPassword\":\"validPassword\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test
    void validResetRequestReachesService() throws Exception {
        mvc.perform(post("/api/v1/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                .content("{\"token\":\"valid-token\",\"newPassword\":\"validPassword\"}"))
                .andExpect(status().isOk());
        verify(service).resetPassword("valid-token", "validPassword");
    }
}
