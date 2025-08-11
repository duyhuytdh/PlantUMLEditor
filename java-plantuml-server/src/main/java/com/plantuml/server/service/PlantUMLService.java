package com.plantuml.server.service;

import net.sourceforge.plantuml.SourceStringReader;
import net.sourceforge.plantuml.FileFormat;
import net.sourceforge.plantuml.FileFormatOption;
import net.sourceforge.plantuml.core.DiagramDescription;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * High-Performance PlantUML Service
 * Uses PlantUML JAR as library for optimal performance
 * Thread-safe and optimized for concurrent requests
 * Supports portable Graphviz configuration
 */
@Service
public class PlantUMLService {

    private static final Logger logger = LoggerFactory.getLogger(PlantUMLService.class);
    
    // Pre-configured format options for better performance
    private static final FileFormatOption SVG_FORMAT = new FileFormatOption(FileFormat.SVG);
    private static final FileFormatOption PNG_FORMAT = new FileFormatOption(FileFormat.PNG);
    
    // Thread pool for concurrent diagram generation
    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    @Value("${plantuml.graphviz.path:}")
    private String graphvizPath;

    @PostConstruct
    public void init() {
        configureGraphviz();
        logger.info("PlantUML Service initialized");
        logger.info("PlantUML Version: {}", getPlantUMLVersion());
        testGraphvizConnection();
    }

    /**
     * Configure Graphviz path for PlantUML
     */
    private void configureGraphviz() {
        try {
            logger.info("Starting Graphviz configuration...");
            logger.info("Configuration value: {}", graphvizPath);
            
            // Try to detect portable Graphviz in project directory first
            String[] possiblePaths = {
                graphvizPath, // From configuration
                "./graphviz/bin/dot.exe", // Relative to project
                "../graphviz/bin/dot.exe", // Parent directory
                "graphviz/bin/dot.exe", // Current directory
                "C:\\graphviz\\bin\\dot.exe", // Common location
                "C:\\Program Files\\Graphviz\\bin\\dot.exe" // Standard installation
            };

            for (String path : possiblePaths) {
                logger.debug("Checking path: {}", path);
                if (path != null && !path.isEmpty()) {
                    Path dotPath = Paths.get(path);
                    logger.debug("Resolved path: {}", dotPath.toAbsolutePath());
                    
                    if (Files.exists(dotPath)) {
                        // Set multiple system properties for PlantUML
                        System.setProperty("GRAPHVIZ_DOT", path);
                        System.setProperty("plantuml.dot", path);
                        
                        // Also set environment variable style
                        String binDir = dotPath.getParent().toString();
                        System.setProperty("GRAPHVIZ_BIN", binDir);
                        
                        logger.info("✅ Graphviz configured at: {}", path);
                        logger.info("✅ Graphviz bin directory: {}", binDir);
                        
                        // Test if file is executable
                        if (Files.isExecutable(dotPath)) {
                            logger.info("✅ Graphviz executable confirmed");
                        } else {
                            logger.warn("⚠️  Graphviz file exists but may not be executable");
                        }
                        return;
                    } else {
                        logger.debug("❌ Path does not exist: {}", path);
                    }
                }
            }

            logger.warn("❌ Graphviz not found in any location. State diagrams may not work properly.");
            logger.info("To use state diagrams, please:");
            logger.info("1. Download Graphviz from https://graphviz.org/download/");
            logger.info("2. Extract to project root or set GRAPHVIZ_DOT environment variable");
            logger.info("3. Restart the application");

        } catch (Exception e) {
            logger.error("Failed to configure Graphviz", e);
        }
    }

    /**
     * Test Graphviz connection with a simple state diagram
     */
    private void testGraphvizConnection() {
        try {
            // Test with simple sequence diagram first (doesn't need Graphviz)
            String testSeqUML = "@startuml\nAlice -> Bob: Test\n@enduml";
            generateSVG(testSeqUML);
            logger.info("Basic PlantUML generation successful");
            
            // Test with state diagram (requires Graphviz)
            String testStateUML = "@startuml\n" +
                                  "[*] --> State1\n" +
                                  "State1 --> State2 : Event\n" +
                                  "State2 --> [*]\n" +
                                  "@enduml";
            
            String svgResult = generateSVG(testStateUML);
            
            // Check if result contains error indicators
            if (svgResult.contains("Dot Executable") || svgResult.contains("does not exist")) {
                logger.error("Graphviz test failed - dot executable not found");
                logger.error("Current GRAPHVIZ_DOT: {}", System.getProperty("GRAPHVIZ_DOT"));
                logger.error("Current plantuml.dot: {}", System.getProperty("plantuml.dot"));
            } else {
                logger.info("Graphviz test successful - state diagrams will work correctly");
            }
        } catch (Exception e) {
            logger.warn("Graphviz test failed - state diagrams may not render properly: {}", e.getMessage());
            logger.debug("Full error details: ", e);
        }
    }

    /**
     * Generate SVG diagram from PlantUML text
     * @param plantumlText PlantUML markup
     * @return SVG content as string
     * @throws IOException if generation fails
     */
    public String generateSVG(String plantumlText) throws IOException {
        logger.debug("Generating SVG diagram, text length: {}", plantumlText.length());
        long startTime = System.currentTimeMillis();
        
        try {
            SourceStringReader reader = new SourceStringReader(plantumlText);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            // Generate diagram
            DiagramDescription description = reader.outputImage(outputStream, SVG_FORMAT);
            String svgContent = outputStream.toString(StandardCharsets.UTF_8.name());
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("SVG generated successfully in {}ms, description: {}", duration, description.getDescription());
            
            return svgContent;
            
        } catch (Exception e) {
            logger.error("Failed to generate SVG diagram", e);
            throw new IOException("Failed to generate SVG diagram: " + e.getMessage(), e);
        }
    }

    /**
     * Generate PNG diagram from PlantUML text
     * @param plantumlText PlantUML markup
     * @return PNG content as byte array
     * @throws IOException if generation fails
     */
    public byte[] generatePNG(String plantumlText) throws IOException {
        logger.debug("Generating PNG diagram, text length: {}", plantumlText.length());
        long startTime = System.currentTimeMillis();
        
        try {
            SourceStringReader reader = new SourceStringReader(plantumlText);
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            
            // Generate diagram
            DiagramDescription description = reader.outputImage(outputStream, PNG_FORMAT);
            byte[] pngContent = outputStream.toByteArray();
            
            long duration = System.currentTimeMillis() - startTime;
            String descriptionText = (description != null && description.getDescription() != null) 
                ? description.getDescription() 
                : "No description available";
            logger.info("PNG generated successfully in {}ms, size: {} bytes, description: {}", 
                       duration, pngContent.length, descriptionText);
            
            return pngContent;
            
        } catch (Exception e) {
            logger.error("Failed to generate PNG diagram", e);
            throw new IOException("Failed to generate PNG diagram: " + e.getMessage(), e);
        }
    }

    /**
     * Generate SVG diagram asynchronously
     * @param plantumlText PlantUML markup
     * @return CompletableFuture with SVG content
     */
    public CompletableFuture<String> generateSVGAsync(String plantumlText) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return generateSVG(plantumlText);
            } catch (IOException e) {
                throw new RuntimeException("Async SVG generation failed", e);
            }
        }, executorService);
    }

    /**
     * Validate PlantUML syntax by attempting to parse
     * @param plantumlText PlantUML markup
     * @return true if valid, false otherwise
     */
    public boolean validateSyntax(String plantumlText) {
        try {
            SourceStringReader reader = new SourceStringReader(plantumlText);
            ByteArrayOutputStream dummyStream = new ByteArrayOutputStream();
            reader.outputImage(dummyStream, SVG_FORMAT);
            return true;
        } catch (Exception e) {
            logger.debug("Syntax validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get PlantUML version information
     * @return version string
     */
    public String getPlantUMLVersion() {
        try {
            return net.sourceforge.plantuml.version.Version.versionString();
        } catch (Exception e) {
            return "Unknown version";
        }
    }

    /**
     * Health check - test basic functionality
     * @return true if service is healthy
     */
    public boolean healthCheck() {
        try {
            String testUML = "@startuml\nAlice -> Bob: Test\n@enduml";
            generateSVG(testUML);
            return true;
        } catch (Exception e) {
            logger.error("Health check failed", e);
            return false;
        }
    }

    /**
     * Get service statistics
     * @return performance metrics
     */
    public ServiceStats getStats() {
        String graphvizPath = System.getProperty("GRAPHVIZ_DOT");
        boolean graphvizAvailable = graphvizPath != null && Files.exists(Paths.get(graphvizPath));
        
        return new ServiceStats(
            getPlantUMLVersion(),
            "MIT License",
            true, // commercial use allowed
            executorService.toString(),
            graphvizPath,
            graphvizAvailable
        );
    }

    /**
     * Service statistics record
     */
    public static class ServiceStats {
        private final String plantUMLVersion;
        private final String license;
        private final boolean commercialUse;
        private final String threadPoolInfo;
        private final String graphvizPath;
        private final boolean graphvizAvailable;

        public ServiceStats(String plantUMLVersion, String license, boolean commercialUse, 
                          String threadPoolInfo, String graphvizPath, boolean graphvizAvailable) {
            this.plantUMLVersion = plantUMLVersion;
            this.license = license;
            this.commercialUse = commercialUse;
            this.threadPoolInfo = threadPoolInfo;
            this.graphvizPath = graphvizPath;
            this.graphvizAvailable = graphvizAvailable;
        }

        public String getPlantUMLVersion() { return plantUMLVersion; }
        public String getLicense() { return license; }
        public boolean isCommercialUse() { return commercialUse; }
        public String getThreadPoolInfo() { return threadPoolInfo; }
        public String getGraphvizPath() { return graphvizPath; }
        public boolean isGraphvizAvailable() { return graphvizAvailable; }
    }
}
