package lk.careerpath.careerpath_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.jwt.secret=CareerPathTestSecretKeyMustBeAtLeastSixtyFourCharactersLongForHS256Security!")
class CareerPathApplicationTests {

	@Test
	void contextLoads() {
	}

}
