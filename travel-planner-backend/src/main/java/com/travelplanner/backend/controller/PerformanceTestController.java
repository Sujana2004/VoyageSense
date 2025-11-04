package com.travelplanner.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
public class PerformanceTestController {
    
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Instant start = Instant.now();
        
        // Simple health check
        Map<String, Object> response = Map.of(
            "status", "UP",
            "timestamp", System.currentTimeMillis(),
            "responseTime", Duration.between(start, Instant.now()).toMillis() + "ms"
        );
        
        return ResponseEntity.ok(response);
    }
}