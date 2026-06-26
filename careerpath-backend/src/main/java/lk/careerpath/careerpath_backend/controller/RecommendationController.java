package lk.careerpath.careerpath_backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.dto.response.ApiResponse;
import lk.careerpath.careerpath_backend.security.UserDetailsImpl;
import lk.careerpath.careerpath_backend.service.impl.AiServiceImpl;
import lk.careerpath.careerpath_backend.service.impl.RecommendationServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Career pathway recommendations")
public class RecommendationController {
    private final RecommendationServiceImpl recommendationService;
    private final AiServiceImpl aiService;

    @PostMapping
    @Operation(summary = "Get personalized career pathway recommendations")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recommend(
            @RequestBody RecommendationRequest req,
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success(
                recommendationService.getRecommendations(user.getId(), req), "Recommendations generated"));
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat with AI career assistant")
    public ResponseEntity<ApiResponse<String>> chat(
            @RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) body.getOrDefault("history", List.of());
        String reply = aiService.chatWithAssistant(message, history);
        return ResponseEntity.ok(ApiResponse.success(reply, "OK"));
    }
}
