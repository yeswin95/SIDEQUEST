package com.sidequest;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class SidequestApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring context loads cleanly with dev profile
    }
}
