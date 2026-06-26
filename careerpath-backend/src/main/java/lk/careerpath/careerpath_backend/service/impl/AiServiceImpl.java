package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@Slf4j
public class AiServiceImpl {
    @Value("${anthropic.api.key:}")
    private String apiKey;
    @Value("${anthropic.api.model:claude-sonnet-4-20250514}")
    private String model;
    private final RestTemplate restTemplate = new RestTemplate();

    public String generateCareerPathwaySummary(RecommendationRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            return buildFallbackSummary(req);
        }
        try {
            String prompt = buildPrompt(req);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");
            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("max_tokens", 600);
            body.put("messages", List.of(Map.of("role", "user", "content", prompt)));
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.anthropic.com/v1/messages", entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
                if (content != null && !content.isEmpty()) {
                    return (String) content.get(0).get("text");
                }
            }
        } catch (Exception e) {
            log.error("AI service error: {}", e.getMessage());
        }
        return buildFallbackSummary(req);
    }

    private String buildPrompt(RecommendationRequest req) {
        return "You are a Sri Lankan education and career guidance counselor. " +
                "A student has the following profile:\n" +
                "- Qualification level: " + req.getQualificationLevel() + "\n" +
                "- Stream: " + req.getStream() + "\n" +
                "- GPA/Results: " + req.getGpa() + "\n" +
                "- Interests: " + req.getInterests() + "\n" +
                "- Skills: " + req.getSkills() + "\n" +
                "- Career goal: " + req.getCareerGoal() + "\n\n" +
                "Provide a personalized 3-4 paragraph career pathway guidance in English. " +
                "Include specific advice about Sri Lankan universities (UoM, USJP, NSBM, SLIIT, etc.), " +
                "NVQ programs, and practical steps to reach their goal. " +
                "Be encouraging and realistic.";
    }

    private String buildFallbackSummary(RecommendationRequest req) {
        String level = req.getQualificationLevel() != null ? req.getQualificationLevel().name() : "your qualification";
        return "Based on your " + level + " background" +
                (req.getStream() != null ? " in the " + req.getStream() + " stream" : "") +
                ", there are excellent pathways available to you in Sri Lanka. " +
                "Consider exploring diploma programs at government vocational institutes, " +
                "or degree programs at leading universities like NSBM, SLIIT, or state universities. " +
                "With dedication and the right program, you can build a strong career in your chosen field.";
    }

    public String chatWithAssistant(String userMessage, List<Map<String, String>> conversationHistory) {
        if (apiKey == null || apiKey.isBlank()) {
            return "AI assistant is not configured. Please contact the administrator.";
        }
        try {
            List<Map<String, Object>> messages = new ArrayList<>();
            conversationHistory.forEach(m -> messages.add(Map.of("role", m.get("role"), "content", m.get("content"))));
            messages.add(Map.of("role", "user", "content", userMessage));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put("max_tokens", 500);
            body.put("system",
                    "You are CareerPath Assistant, an AI career guidance counselor specializing in Sri Lankan education and career pathways. Help students discover suitable courses, universities, and career paths. Be friendly, encouraging, and specific about Sri Lankan opportunities.");
            body.put("messages", messages);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "https://api.anthropic.com/v1/messages", entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
                if (content != null && !content.isEmpty())
                    return (String) content.get(0).get("text");
            }
        } catch (Exception e) {
            log.error("AI chat error: {}", e.getMessage());
        }
        return "I'm having trouble connecting right now. Please try again later.";
    }
}
