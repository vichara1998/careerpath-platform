package lk.careerpath.careerpath_backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {
    @Test
    void onlyAccessTokensCanAuthenticateRequests() {
        JwtTokenProvider provider = new JwtTokenProvider();
        ReflectionTestUtils.setField(provider, "jwtSecret", "test-secret-with-at-least-32-bytes-for-hmac-signing");
        ReflectionTestUtils.setField(provider, "jwtExpirationMs", 60000L);
        ReflectionTestUtils.setField(provider, "refreshExpirationMs", 120000L);
        var user = User.withUsername("student@example.com").password("unused").roles("STUDENT").build();

        assertTrue(provider.validateToken(provider.generateToken(user)));
        assertFalse(provider.validateToken(provider.generateRefreshToken(user)));
        assertFalse(provider.validateToken("invalid-token"));
    }
}
