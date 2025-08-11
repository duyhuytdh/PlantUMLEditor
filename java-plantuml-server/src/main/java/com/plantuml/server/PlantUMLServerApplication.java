package com.plantuml.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * PlantUML Java Server Application
 * High-performance diagram generation using PlantUML JAR as library
 * License: MIT - Commercial Use Allowed
 */
@SpringBootApplication
public class PlantUMLServerApplication {

    public static void main(String[] args) {
        System.out.println("🚀 Starting PlantUML Java Server");
        System.out.println("📄 License: MIT - Commercial Use Allowed");
        System.out.println("⚡ High-Performance PlantUML Library Integration");
        System.out.println("🏢 Commercial Safe - No GPL Dependencies");
        System.out.println();
        
        SpringApplication.run(PlantUMLServerApplication.class, args);
    }

    /**
     * Configure CORS for direct frontend access
     * Allows React frontend to call Java server directly
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns(
                            "http://localhost:*",  // All localhost ports
                            "http://127.0.0.1:*"   // All 127.0.0.1 ports
                        )
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD")
                        .allowedHeaders("*")
                        .allowCredentials(true)
                        .maxAge(3600);
            }
        };
    }
}
