package com.plantuml.server.controller;

import com.plantuml.server.service.PlantUMLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CompletableFuture;

/**
 * PlantUML REST API Controller
 * High-performance endpoints for diagram generation
 */
@RestController
@RequestMapping("/api/plantuml")
public class PlantUMLController {

    private static final Logger logger = LoggerFactory.getLogger(PlantUMLController.class);

    @Autowired
    private PlantUMLService plantUMLService;

    /**
     * Generate SVG diagram from PlantUML text
     */
    @PostMapping(value = "/svg", 
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> generateSVG(@Valid @RequestBody PlantUMLRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Generating SVG diagram, text length: {}", request.plantumlText.length());
            
            String svgContent = plantUMLService.generateSVG(request.plantumlText);
            long duration = System.currentTimeMillis() - startTime;
            
            Map<String, Object> response = new HashMap<>();
            response.put("svg", svgContent);
            response.put("method", "java-plantuml-library");
            response.put("license", "MIT - Commercial Safe");
            response.put("performance", duration + "ms");
            response.put("timestamp", System.currentTimeMillis());
            
            logger.info("SVG generated successfully in {}ms", duration);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to generate SVG", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate diagram: " + e.getMessage());
            errorResponse.put("method", "java-plantuml-library");
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Generate PNG diagram from PlantUML text
     */
    @PostMapping(value = "/png",
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> generatePNG(@Valid @RequestBody PlantUMLRequest request) {
        try {
            logger.info("Generating PNG diagram, text length: {}", request.plantumlText.length());
            
            byte[] pngContent = plantUMLService.generatePNG(request.plantumlText);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .contentLength(pngContent.length)
                    .body(pngContent);
                    
        } catch (Exception e) {
            logger.error("Failed to generate PNG", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate SVG diagram asynchronously
     */
    @PostMapping(value = "/svg/async",
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public CompletableFuture<ResponseEntity<Map<String, Object>>> generateSVGAsync(@Valid @RequestBody PlantUMLRequest request) {
        return plantUMLService.generateSVGAsync(request.plantumlText)
                .thenApply(svgContent -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("svg", svgContent);
                    response.put("method", "java-plantuml-library-async");
                    response.put("license", "MIT - Commercial Safe");
                    response.put("timestamp", System.currentTimeMillis());
                    
                    return ResponseEntity.ok(response);
                })
                .exceptionally(throwable -> {
                    logger.error("Async SVG generation failed", throwable);
                    
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("error", "Async generation failed: " + throwable.getMessage());
                    errorResponse.put("method", "java-plantuml-library-async");
                    
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                });
    }

    /**
     * Validate PlantUML syntax
     */
    @PostMapping(value = "/validate",
                 consumes = MediaType.APPLICATION_JSON_VALUE,
                 produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> validateSyntax(@Valid @RequestBody PlantUMLRequest request) {
        boolean isValid = plantUMLService.validateSyntax(request.plantumlText);
        
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        response.put("text", request.plantumlText);
        response.put("timestamp", System.currentTimeMillis());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "OK");
        health.put("message", "PlantUML Java Server - Commercial Safe");
        health.put("license", "MIT");
        health.put("commercial", true);
        health.put("timestamp", System.currentTimeMillis());
        
        // Test PlantUML functionality
        boolean isHealthy = plantUMLService.healthCheck();
        health.put("plantuml", isHealthy ? "available" : "error");
        
        // Service statistics
        var stats = plantUMLService.getStats();
        health.put("stats", Map.of(
            "version", stats.getPlantUMLVersion(),
            "license", stats.getLicense(),
            "commercial", stats.isCommercialUse(),
            "threadPool", stats.getThreadPoolInfo(),
            "graphviz", Map.of(
                "available", stats.isGraphvizAvailable(),
                "path", stats.getGraphvizPath() != null ? stats.getGraphvizPath() : "not configured"
            )
        ));
        
        return ResponseEntity.ok(health);
    }

    /**
     * Get service information
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        var stats = plantUMLService.getStats();
        
        Map<String, Object> info = new HashMap<>();
        info.put("server", "PlantUML Java Server");
        info.put("version", "1.0.0");
        info.put("license", "MIT");
        info.put("plantuml_version", stats.getPlantUMLVersion());
        info.put("plantuml_license", "MIT");
        info.put("commercial_use", true);
        info.put("performance", "Optimized Java Library Integration");
        info.put("features", java.util.List.of(
            "High-performance diagram generation",
            "Commercial-safe MIT license",
            "Thread-safe concurrent processing",
            "Async generation support",
            "Syntax validation",
            "Multiple output formats (SVG, PNG)"
        ));
        
        return ResponseEntity.ok(info);
    }

    /**
     * Request DTO for PlantUML text input
     */
    public static class PlantUMLRequest {
        @NotBlank(message = "PlantUML text is required")
        public String plantumlText;
    }
}
