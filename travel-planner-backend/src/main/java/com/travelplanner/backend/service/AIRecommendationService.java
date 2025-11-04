package com.travelplanner.backend.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIRecommendationService {
	
	private static final Logger log = LoggerFactory.getLogger(AIRecommendationService.class);
    
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public AIRecommendationService(ChatModel chatModel, ObjectMapper objectMapper) {
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getTravelRecommendation(
            String source, String destination, 
            int passengers, double budget, 
            String comfortLevel, String sourceWeather, 
            String destWeather) {
        
        try {
            String promptText = """
               [TRAVEL ANALYSIS]
                FROM: %s TO: %s
                PASSENGERS: %d | BUDGET: ₹%.2f | COMFORT: %s
                WEATHER: %s (source) → %s (destination)
                
                RETURN ONLY VALID JSON (no other text):
                {
                  "recommendedMode": "car/train/bus/flight",
                  "distanceEstimate": 123.45,
                  "confidenceScore": 0.85,
                  "reasoning": "Brief practical explanation"
                }
                """.formatted(source, destination, passengers, budget,
                 comfortLevel, sourceWeather, destWeather);
            
            SystemMessage systemMessage = new SystemMessage("""
                    You are a practical travel planner for Indian routes. 
                    CRITICAL: Return ONLY valid JSON, no explanations.
                    - Use realistic distances for Indian travel
                    - Consider budget and comfort level seriously  
                    - Be concise in reasoning (max 2 sentences)
                    - recommendedMode: car/train/bus/flight only
                    - distanceEstimate: realistic km between Indian cities
                    - confidenceScore: 0.0 to 1.0
                    """);
            UserMessage userMessage = new UserMessage(promptText);
            Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
            
            String response = chatModel.call(prompt).getResult().getOutput().getText();
            
            return parseAIResponse(response);
            
        } catch (Exception e) {
            // Fallback recommendations
            return getFallbackRecommendation(source, destination, budget, comfortLevel);
        }
    }

    private Map<String, Object> parseAIResponse(String response) {
        try {
            // Try to parse as JSON
        	String cleanJson = extractJsonFromResponse(response);
            log.info("Cleaned JSON: {}", cleanJson);
            return objectMapper.readValue(cleanJson, Map.class);
        } catch (Exception e) {
            // If JSON parsing fails, extract information from text
        	log.warn("JSON parsing failed, extracting from text: {}", e.getMessage());
            return extractFromText(response);
        }
    }
    
 // ROBUST JSON EXTRACTION FOR MISTRAL
    private String extractJsonFromResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return "{}";
        }
        
        // Remove markdown code blocks
        String cleaned = response.replaceAll("(?i)```json", "")
                               .replaceAll("```", "")
                               .trim();
        
        // Extract JSON between first { and last }
        int start = cleaned.indexOf("{");
        int end = cleaned.lastIndexOf("}") + 1;
        
        if (start >= 0 && end > start && end <= cleaned.length()) {
            String json = cleaned.substring(start, end);
            // Basic validation
            if (json.startsWith("{") && json.endsWith("}")) {
                return json;
            }
        }
        
        log.warn("No valid JSON found in response");
        return "{}";
    }

    private Map<String, Object> extractFromText(String response) {
        String recommendedMode = "car";
        double distanceEstimate = 250.0;
        double confidenceScore = 0.8;
        String reasoning = "Based on your travel preferences";

        // Simple text analysis
        String lowerResponse = response.toLowerCase();
        if (lowerResponse.contains("train")) recommendedMode = "train";
        if (lowerResponse.contains("bus")) recommendedMode = "bus";
        if (lowerResponse.contains("flight") || lowerResponse.contains("plane")) recommendedMode = "flight";
        if (lowerResponse.contains("car") || lowerResponse.contains("drive")) recommendedMode = "car";
        
     // Extract numbers from text for distance
        if (response.matches(".*\\d+\\s*km.*")) {
            String[] parts = response.split("\\s*km\\s*");
            for (String part : parts) {
                if (part.matches(".*\\d+.*")) {
                    try {
                        String num = part.replaceAll(".*?(\\d+).*", "$1");
                        distanceEstimate = Double.parseDouble(num);
                        break;
                    } catch (NumberFormatException e) {
                        // Keep default
                    }
                }
            }
        }
        
        return Map.of(
            "recommendedMode", recommendedMode,
            "distanceEstimate", distanceEstimate,
            "confidenceScore", confidenceScore,
            "reasoning", reasoning
        );
    }

    private Map<String, Object> getFallbackRecommendation(String source, String destination, double budget, String comfortLevel) {
        // Simple heuristic-based fallback
        String recommendedMode;
        double distanceEstimate;
        double confidenceScore;
        String reasoning;

        if (budget > 5000) {
            recommendedMode = "flight";
            distanceEstimate = 800.0;
            confidenceScore = 0.9;
            reasoning = "Budget allows for comfortable air travel";
        } else if (budget > 1500) {
            recommendedMode = "train";
            distanceEstimate = 500.0;
            confidenceScore = 0.8;
            reasoning = "Train offers good balance of comfort and cost";
        } else {
            recommendedMode = "bus";
            distanceEstimate = 300.0;
            confidenceScore = 0.7;
            reasoning = "Most economical option for your budget";
        }

        // Adjust based on comfort level
        if ("LUXURY".equals(comfortLevel) && !"flight".equals(recommendedMode)) {
            recommendedMode = "train";
            reasoning += " with premium comfort options";
        }

        return Map.of(
            "recommendedMode", recommendedMode,
            "distanceEstimate", distanceEstimate,
            "confidenceScore", confidenceScore,
            "reasoning", reasoning
        );
    }
}