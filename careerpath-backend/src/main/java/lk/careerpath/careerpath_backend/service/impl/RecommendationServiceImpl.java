package lk.careerpath.careerpath_backend.service.impl;

import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.entity.Recommendation;
import lk.careerpath.careerpath_backend.entity.User;
import lk.careerpath.careerpath_backend.enums.CourseMode;
import lk.careerpath.careerpath_backend.exception.ResourceNotFoundException;
import lk.careerpath.careerpath_backend.repository.CourseRepository;
import lk.careerpath.careerpath_backend.repository.RecommendationRepository;
import lk.careerpath.careerpath_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl {
    private final CourseRepository courseRepository;
    private final RecommendationRepository recommendationRepository;
    private final UserRepository userRepository;
    private final AiServiceImpl aiService;

    public Map<String, Object> getRecommendations(Long userId, RecommendationRequest req) {
        String conflict = lk.careerpath.careerpath_backend.service.QualificationRules.conflict(req.getQualificationLevel(), req.getQualifications());
        if (conflict != null) throw new lk.careerpath.careerpath_backend.exception.BadRequestException(conflict);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Suggest exploration fields; these do not establish admission eligibility.
        List<String> careerFields = determineCareerFields(req);

        List<CourseResponse> candidates = courseRepository.findRecommendationCandidates().stream()
                .filter(c -> c.getApplicationDeadline() == null || !c.getApplicationDeadline().isBefore(java.time.LocalDate.now(java.time.ZoneId.of("Asia/Colombo"))))
                // Field relevance is mandatory, even when relaxing practical preferences.
                .map(c -> score(c, req, careerFields))
                .sorted(Comparator.comparingInt((CourseResponse c) -> c.getMatchWarnings().size())
                    .thenComparing(Comparator.comparingInt(CourseResponse::getMatchScore).reversed())
                    .thenComparing(CourseResponse::getId)).toList();
        // Entry rules are hard constraints. Never relax them as catalogue fallback.
        List<CourseResponse> eligible = candidates.stream()
                .filter(c -> Set.of("MEETS_LISTED_REQUIREMENT", "OPEN_ENTRY", "CONDITIONAL_MATCH").contains(c.getEligibilityStatus())).toList();
        List<CourseResponse> inField = eligible.stream().filter(c -> matchesFields(c, careerFields)).toList();
        List<CourseResponse> alternatives = eligible.stream().filter(c -> !matchesFields(c, careerFields)).toList();
        String emptyReason = careerFields.isEmpty() ? "SELECT_FIELD"
                : candidates.stream().filter(c -> matchesFields(c, careerFields)).anyMatch(c -> "NEEDS_VERIFICATION".equals(c.getEligibilityStatus()))
                    ? "ENTRY_REQUIREMENTS_UNVERIFIED" : "NO_ELIGIBLE_COURSES";
        String emptyMessage = switch (emptyReason) {
            case "SELECT_FIELD" -> "Choose an interest field or study stream before requesting recommendations.";
            case "ENTRY_REQUIREMENTS_UNVERIFIED" -> "No courses with confirmed compatible entry requirements were found in your selected fields. Some providers have incomplete or unclear entry requirements; contact them before applying.";
            default -> "Courses in your selected fields that match your qualifications are not available now. Explore the separately listed options in other fields.";
        };
        boolean catalogueFallback = inField.stream().anyMatch(c -> !c.getMatchWarnings().isEmpty());
        List<CourseResponse> selected = inField;
        String aiSummary = selected.isEmpty() ? emptyMessage : aiService.generateCareerPathwaySummary(req, selected);

        // Save recommendation
        Recommendation rec = Recommendation.builder()
                .user(user)
                .careerField(String.join(", ", careerFields.stream().limit(3).toList()))
                .pathwaySummary(aiSummary)
                .build();
        recommendationRepository.save(rec);

        return Map.of(
                "careerFields", careerFields,
                "pathwaySummary", aiSummary,
                "courseMatchType", selected.isEmpty() ? "none" : catalogueFallback ? "catalogue" : "profile",
                "recommendedCourses", selected,
                "scoringVersion", "rules-v5",
                "alternativeCourses", alternatives,
                "emptyReason", selected.isEmpty() ? emptyReason : "",
                "emptyMessage", selected.isEmpty() ? emptyMessage : "");
    }

    private List<String> determineCareerFields(RecommendationRequest req) {
        // Qualifications constrain entry routes, not a person's interests or ambitions.
        Set<String> fields = new LinkedHashSet<>();
        if (req.getInterests() != null) req.getInterests().stream()
                .filter(Objects::nonNull).map(String::trim).filter(value -> !value.isBlank()).forEach(fields::add);
        // Explicit interests take precedence over fields inferred from the study stream.
        if (!fields.isEmpty()) return List.copyOf(fields);
        fields.addAll(switch (normalize(req.getStream())) {
            case "computing" -> List.of("Software Engineering", "Data Science", "AI/ML", "Cybersecurity", "Networking");
            case "engineering" -> List.of("Engineering", "Software Engineering", "Data Science", "Networking", "Environmental Science");
            case "health" -> List.of("Medicine", "Food Technology", "Environmental Science");
            case "agriculture" -> List.of("Agriculture", "Food Technology", "Environmental Science");
            case "vocational" -> List.of("Engineering", "Networking", "Software Engineering", "Tourism", "Agriculture", "Arts & Design");
            case "science" -> List.of("Engineering", "Software Engineering", "Data Science", "Agriculture", "Food Technology", "Environmental Science");
            case "maths", "technology" -> List.of("Engineering", "Software Engineering", "Data Science", "AI/ML", "Cybersecurity", "Networking");
            case "bio" -> List.of("Medicine", "Agriculture", "Food Technology", "Environmental Science");
            case "biotechnology" -> List.of("Agriculture", "Food Technology", "Environmental Science");
            case "commerce" -> List.of("Business", "Accounting", "Marketing");
            case "arts" -> List.of("Arts & Design", "Media Studies", "Tourism", "Education", "Marketing");
            default -> List.of();
        });
        return List.copyOf(fields);
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", " ").trim();
    }

    private Set<String> tags(String value) {
        Set<String> result = new HashSet<>();
        if (value != null) for (String tag : value.split(","))
            if (!normalize(tag).isBlank()) result.add(normalize(tag));
        return result;
    }

    private CourseResponse score(lk.careerpath.careerpath_backend.entity.Course c,
                                 RecommendationRequest req, List<String> fields) {
        List<String> reasons = new ArrayList<>(), warnings = new ArrayList<>();
        Set<String> courseTags = tags(c.getCareerFields());
        int score = 0;
        if (req.getInterests() != null && req.getInterests().stream().anyMatch(i -> courseTags.contains(normalize(i)))) {
            score += 40; reasons.add("Matches your selected interests");
        } else if (fields.stream().anyMatch(f -> courseTags.contains(normalize(f)))) {
            score += 15; reasons.add("Related to a suggested field for your study background");
        }
        if (req.getInterests() != null && !req.getInterests().isEmpty()
                && req.getInterests().stream().noneMatch(i -> courseTags.contains(normalize(i))))
            warnings.add("Outside your selected interest fields");
        String goal = normalize(req.getCareerGoal());
        String type = c.getType() == null ? "" : c.getType().name();
        if ((goal.contains("degree") && type.equals("DEGREE"))
            || (goal.contains("professional") && Set.of("CERTIFICATE", "POSTGRADUATE").contains(type))
            || ((goal.contains("first job") || goal.contains("improve my skills") || goal.contains("change careers"))
                && Set.of("NVQ", "VOCATIONAL", "DIPLOMA", "SHORT_COURSE", "ONLINE_CERTIFICATION").contains(type))
            || (goal.contains("start a business") && courseTags.contains("business"))) {
            score += 20; reasons.add("Supports your selected career goal");
        }
        Map<String, Set<String>> skills = Map.of(
            "programming", Set.of("software engineering", "data science", "cybersecurity", "ai ml"),
            "mathematics", Set.of("engineering", "data science", "accounting"),
            "creativity", Set.of("arts design", "media studies", "marketing"),
            "writing", Set.of("media studies", "marketing"),
            "leadership", Set.of("business"), "languages", Set.of("tourism", "education"));
        if (req.getSkills() != null && req.getSkills().stream().anyMatch(skill ->
                skills.getOrDefault(normalize(skill), Set.of()).stream().anyMatch(courseTags::contains))) {
            score += 10; reasons.add("Builds on your selected skills");
        }
        if (score == 0) warnings.add("No direct match to your interests, skills, goals or study background");
        if (req.getPreferredMode() != null && !req.getPreferredMode().isBlank()) {
            if (c.getMode() != null && c.getMode().name().equalsIgnoreCase(req.getPreferredMode())) {
                score += 10; reasons.add("Matches your preferred study mode");
            } else warnings.add("Study mode differs from your preference");
        }
        if (req.getDistrict() != null && !req.getDistrict().isBlank()) {
            if (c.getMode() == CourseMode.ONLINE || normalize(req.getDistrict()).equals(normalize(c.getDistrict()))) {
                score += 5; reasons.add(c.getMode() == CourseMode.ONLINE ? "Online study is accessible from your district" : "Available in your selected district");
            } else warnings.add("Located outside your selected district");
        }
        if (req.getMaxBudget() != null) {
            if (c.getTotalFee() == null) warnings.add("Total fee unavailable; confirm affordability");
            else if (c.getTotalFee().compareTo(req.getMaxBudget()) > 0) warnings.add("Exceeds your total budget");
            else { score += 10; reasons.add("Within your total budget"); }
        }
        if (req.getMaxDurationMonths() != null) {
            if (c.getDurationMonths() == null) warnings.add("Duration unavailable");
            else if (c.getDurationMonths() > req.getMaxDurationMonths()) warnings.add("Longer than your preferred duration");
            else { score += 5; reasons.add("Within your preferred duration"); }
        }
        String status = assessEligibility(c, req, warnings);
        CourseResponse response = toSimpleResponse(c);
        response.setMatchScore(score);
        response.setMatchReasons(reasons);
        response.setMatchWarnings(warnings);
        response.setEligibilityStatus(status);
        return response;
    }

    private boolean matchesFields(CourseResponse course, List<String> fields) {
        return fields.stream().anyMatch(field -> tags(course.getCareerFields()).contains(normalize(field)));
    }

    private String assessEligibility(lk.careerpath.careerpath_backend.entity.Course course,
                                     RecommendationRequest req, List<String> warnings) {
        var qualifications = new HashSet<lk.careerpath.careerpath_backend.enums.QualificationLevel>();
        if (req.getQualificationLevel() != null) qualifications.add(req.getQualificationLevel());
        if (req.getQualifications() != null) qualifications.addAll(req.getQualifications());
        int attained = qualifications.stream().filter(Objects::nonNull).mapToInt(level -> switch (level) {
            case OL_FAIL -> 0; case OL_PASS, AL_FAIL -> 1; case AL_PASS -> 2; case GRADUATE -> 3; default -> -1;
        }).max().orElse(-1);
        String text = normalize(course.getEligibility());
        int stage = switch (normalize(course.getLevel())) {
            case "a l", "al", "a level", "advanced level" -> 2;
            case "o l", "ol", "o level", "ordinary level" -> 1;
            default -> -1;
        };
        if (stage >= 0 && attained >= 0 && attained < stage) return "BRIDGING_REQUIRED";
        boolean uncertain = false;
        for (String route : text.split("\\bor\\b(?!\\s+(above|higher|more|over)\\b)")) {
            route = route.trim();
            boolean noSchoolPass = route.startsWith("o l fail") || route.startsWith("ol fail") || route.startsWith("o l incomplete") || route.startsWith("no o l required") || route.startsWith("o l not required");
            int required = stage;
            if (!noSchoolPass && route.matches(".*\\b(a l|al|a level|advanced level)\\b.*")) required = Math.max(required, 2);
            else if (!noSchoolPass && route.matches(".*\\b(o l|ol|o level|ordinary level)\\b.*")) required = Math.max(required, 1);
            if (route.contains("bachelor") || route.equals("degree")) required = 3;
            boolean diploma = route.contains("diploma");
            boolean professional = route.contains("professional qualification") || route.contains("professional certification");
            boolean open = noSchoolPass || route.startsWith("open entry") || route.startsWith("no formal qualifications")
                || route.startsWith("no formal educational qualifications") || route.startsWith("no minimum qualifications")
                || route.startsWith("no entry requirements");
            var gradeMatcher = java.util.regex.Pattern.compile("grade ([0-9]{1,2})").matcher(route);
            boolean gradeRule = gradeMatcher.find();
            if (diploma && !qualifications.contains(lk.careerpath.careerpath_backend.enums.QualificationLevel.DIPLOMA)) { uncertain = true; continue; }
            if (professional && !qualifications.contains(lk.careerpath.careerpath_backend.enums.QualificationLevel.PROFESSIONAL)) { uncertain = true; continue; }
            if (gradeRule) {
                int grade = Integer.parseInt(gradeMatcher.group(1));
                Integer completed = req.getHighestSchoolGrade();
                if (completed == null && attained >= 1) completed = attained >= 2 ? 13 : 11;
                if (completed == null) { uncertain = true; continue; }
                if (completed < grade) continue;
            }
            if (required >= 0 && attained < required) { if (attained < 0) uncertain = true; continue; }
            if (route.isBlank() || (!open && required < 0 && !gradeRule && !diploma && !professional)) { uncertain = true; continue; }
            var ageMatcher = java.util.regex.Pattern.compile("age ([0-9]{1,2})").matcher(route);
            boolean ageRule = ageMatcher.find();
            if (ageRule && req.getAge() != null && req.getAge() < Integer.parseInt(ageMatcher.group(1))) continue;
            boolean simple = Set.of("o l pass", "ol pass", "o level pass", "a l pass", "al pass", "a level pass",
                "bachelor degree", "bachelors degree", "bachelor s degree", "open entry", "open entry contact provider",
                "no formal qualifications required", "no formal educational qualifications required", "no minimum qualifications", "no entry requirements").contains(route);
            if (simple && !(open && stage >= 0 && attained < 0)) return open ? "OPEN_ENTRY" : "MEETS_LISTED_REQUIREMENT";
            warnings.add("Your qualification or school grade fits the listed entry route; confirm subject grades, experience and other provider conditions before applying");
            if (ageRule && req.getAge() == null) warnings.add("Confirm the provider's minimum age requirement");
            return "CONDITIONAL_MATCH";
        }
        return uncertain ? "NEEDS_VERIFICATION" : "BRIDGING_REQUIRED";
    }


    private CourseResponse toSimpleResponse(lk.careerpath.careerpath_backend.entity.Course c) {
        return CourseResponse.builder()
                .id(c.getId()).title(c.getTitle()).type(c.getType()).level(c.getLevel())
                .eligibility(c.getEligibility()).applicationDeadline(c.getApplicationDeadline()).mode(c.getMode()).totalFee(c.getTotalFee()).district(c.getDistrict())
                .thumbnailUrl(c.getThumbnailUrl()).durationMonths(c.getDurationMonths())
                .careerFields(c.getCareerFields()).reviewCount(c.getReviewCount())
                .universityName(c.getUniversity() == null ? null : c.getUniversity().getName())
                .averageRating(c.getAverageRating()).build();
    }
}
