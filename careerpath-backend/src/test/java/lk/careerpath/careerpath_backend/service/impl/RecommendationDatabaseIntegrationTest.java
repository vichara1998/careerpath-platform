package lk.careerpath.careerpath_backend.service.impl;

import jakarta.persistence.EntityManager;
import lk.careerpath.careerpath_backend.dto.request.RecommendationRequest;
import lk.careerpath.careerpath_backend.dto.response.CourseResponse;
import lk.careerpath.careerpath_backend.entity.User;
import lk.careerpath.careerpath_backend.enums.QualificationLevel;
import lk.careerpath.careerpath_backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import java.nio.file.*;
import java.util.*;
import javax.xml.parsers.DocumentBuilderFactory;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/** Explicit opt-in; uses the local catalogue and rolls every test write back. */
@DataJpaTest(properties={"spring.jpa.hibernate.ddl-auto=none", "spring.jpa.show-sql=false", "logging.level.org.hibernate.SQL=OFF"})
@AutoConfigureTestDatabase(replace=AutoConfigureTestDatabase.Replace.NONE)
@Import({RecommendationServiceImpl.class, RecommendationDatabaseIntegrationTest.GuidanceConfiguration.class})
@EnabledIfSystemProperty(named="careerpath.live-db-tests", matches="true")
class RecommendationDatabaseIntegrationTest {
    @Autowired CourseRepository courses;
    @Autowired UserRepository users;
    @Autowired RoleRepository roles;
    @Autowired RecommendationServiceImpl recommendations;
    @Autowired EntityManager entities;
    @org.springframework.boot.test.context.TestConfiguration(proxyBeanMethods=false)
    static class GuidanceConfiguration {
        @org.springframework.context.annotation.Bean
        AiServiceImpl testGuidance() {
            return new AiServiceImpl() {
                @Override public String generateCareerPathwaySummary(RecommendationRequest req, List<CourseResponse> courses) {
                    return "Database-backed test guidance";
                }
            };
        }
    }

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) throws Exception {
        Properties config=new Properties();
        try(var in=Files.newInputStream(Path.of("src/main/resources/application.properties"))){config.load(in);}
        Map<String,String> env=new HashMap<>(System.getenv());
        var factory=DocumentBuilderFactory.newInstance();
        factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
        var nodes=factory.newDocumentBuilder().parse(Path.of(".idea/workspace.xml").toFile()).getElementsByTagName("env");
        for(int i=0;i<nodes.getLength();i++){
            var node=(org.w3c.dom.Element)nodes.item(i);
            if(Set.of("USER_NAME","DB_PASSWORD","DB_URL").contains(node.getAttribute("name")))
                env.putIfAbsent(node.getAttribute("name"),node.getAttribute("value"));
        }
        registry.add("spring.datasource.url",()->env.getOrDefault("DB_URL",config.getProperty("spring.datasource.url")));
        registry.add("spring.datasource.username",()->env.get("USER_NAME"));
        registry.add("spring.datasource.password",()->env.get("DB_PASSWORD"));
    }

    @Test void repositoryIncludesPublishedNullAndFalseButExcludesRejectedAndUnpublished() {
        var published=courses.findRecommendationCandidates();
        assertTrue(published.size()>1,"Real catalogue must not collapse to Network l11");
        var course=published.getFirst();
        Long id=course.getId();
        course.setRejected(null);entities.flush();
        assertTrue(courses.findRecommendationCandidates().stream().anyMatch(c->c.getId().equals(id)));
        course.setRejected(true);entities.flush();
        assertFalse(courses.findRecommendationCandidates().stream().anyMatch(c->c.getId().equals(id)));
        course.setRejected(false);course.setApproved(false);entities.flush();
        assertFalse(courses.findRecommendationCandidates().stream().anyMatch(c->c.getId().equals(id)));
    }

    @SuppressWarnings("unchecked")
    @Test void realCatalogueSupportsOtherFieldsForOlFailAndAgricultureForAlPass() {

        var user=users.saveAndFlush(User.builder().fullName("Recommendation integration test")
            .email("recommendation-"+UUID.randomUUID()+"@example.test").passwordHash("!disabled-test-account!")
            .role(roles.findAll().getFirst()).build());
        var request=new RecommendationRequest();
        request.setQualificationLevel(QualificationLevel.OL_FAIL);
        request.setInterests(List.of("Agriculture"));request.setHighestSchoolGrade(9);request.setAge(17);
        var olResult=recommendations.getRecommendations(user.getId(),request);
        var selected=(List<CourseResponse>)olResult.get("recommendedCourses");
        var alternatives=(List<CourseResponse>)olResult.get("alternativeCourses");
        assertTrue(selected.isEmpty(),"Current Agriculture degree needs A/L passes");
        assertFalse(alternatives.isEmpty(),"Published vocational alternatives must be read from the real database");
        assertTrue(alternatives.stream().noneMatch(c->"Network l11".equals(c.getTitle())));
        request.setQualificationLevel(QualificationLevel.AL_PASS);request.setStream("Bio");
        var alResult=recommendations.getRecommendations(user.getId(),request);
        var agriculture=(List<CourseResponse>)alResult.get("recommendedCourses");
        assertFalse(agriculture.isEmpty(),"A/L learner should receive the real Agriculture course");
        assertTrue(agriculture.stream().allMatch(c->c.getCareerFields().contains("Agriculture")));
        System.out.println("LIVE_CATALOGUE_CHECK candidates="+courses.findRecommendationCandidates().size()
            +" olIncompleteOtherFields="+alternatives.size()+" alPassedAgriculture="+agriculture.size());
    }
}
