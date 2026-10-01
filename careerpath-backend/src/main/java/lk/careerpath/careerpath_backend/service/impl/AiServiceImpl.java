package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
@Slf4j
public class AiServiceImpl {
    @Value("${gemini.api.key:}")
    private String apiKey;
    @Value("${gemini.api.model:gemini-2.0-flash}")
    private String model;
    private final RestTemplate restTemplate = new RestTemplate();

    public String generateCareerPathwaySummary(RecommendationRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            return buildFallbackSummary(req);
        }
        try {
            String response = callGemini(List.of(userContent(buildPrompt(req))),
                    "You are a Sri Lankan education and career guidance counselor.", 600);
            return response != null ? response : buildFallbackSummary(req);
        } catch (RestClientResponseException e) {
            log.error("Gemini recommendation failed: status={}, response={}", e.getStatusCode(),
                    e.getResponseBodyAsString());
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
            return buildFallbackChatResponse(userMessage);
        }
        try {
            List<Map<String, Object>> contents = new ArrayList<>();
            conversationHistory.forEach(message -> contents.add(Map.of(
                    "role", "assistant".equals(message.get("role")) ? "model" : "user",
                    "parts", List.of(Map.of("text", message.get("content"))))));
            contents.add(userContent(userMessage));
            String response = callGemini(contents,
                    "You are CareerPath Assistant, an AI career guidance counselor specializing in Sri Lankan education and career pathways. Help students discover suitable courses, universities, and career paths. Be friendly, encouraging, and specific about Sri Lankan opportunities.",
                    500);
            return response != null ? response : buildFallbackChatResponse(userMessage);
        } catch (RestClientResponseException e) {
            log.error("Gemini chat failed: status={}, response={}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("AI chat error: {}", e.getMessage());
        }
        return "I'm having trouble connecting right now. Please try again later.";
    }

    private Map<String, Object> userContent(String text) {
        return Map.of("role", "user", "parts", List.of(Map.of("text", text)));
    }

    @SuppressWarnings("unchecked")
    private String callGemini(List<Map<String, Object>> contents, String systemInstruction, int maxTokens) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> body = new HashMap<>();
        body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", systemInstruction))));
        body.put("contents", contents);
        body.put("generationConfig", Map.of("maxOutputTokens", maxTokens, "temperature", 0.7));

        ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://generativelanguage.googleapis.com/v1beta/models/" + model
                        + ":generateContent?key=" + apiKey,
                new HttpEntity<>(body, headers), Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
                if (parts != null && !parts.isEmpty())
                    return parts.get(0).get("text");
            }
        }
        return null;
    }

    private String buildFallbackChatResponse(String userMessage) {
        String message = userMessage == null ? "" : userMessage.toLowerCase(Locale.ROOT);
        if (message.contains("course") || message.contains("study") || message.contains("degree")) {
            return "Start with the Courses directory. Compare the study mode, district, duration, fees, and entry requirements, then shortlist two or three options before deciding.";
        }
        if (message.contains("career") || message.contains("job") || message.contains("work")) {
            return "A good next step is to connect your interests to a practical skill. Explore the Career Guide, then compare courses that build that skill through a recognised Sri Lankan provider.";
        }
        if (message.contains("university") || message.contains("campus")) {
            return "Use the course directory to compare state and private providers, delivery mode, location, duration, and fees. Your best option is the one that fits both your goal and your current qualifications.";
        }
        return "I can help you think through courses, qualifications, study modes, and career directions in Sri Lanka. Tell me what you have studied and what kind of work interests you.";
    }
}
