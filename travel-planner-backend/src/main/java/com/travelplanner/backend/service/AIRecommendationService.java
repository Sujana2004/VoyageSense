package com.travelplanner.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIRecommendationService {
    
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
                Analyze this travel plan and provide specific recommendations:
                
                Travel Details:
                - From: {source} to {destination}
                - Passengers: {passengers}
                - Budget: ${budget}
                - Comfort Level: {comfortLevel}
                - Source Weather: {sourceWeather}
                - Destination Weather: {destWeather}
                
                Provide response in this exact JSON format:
                {
                  "recommendedMode": "car/train/bus/flight",
                  "distanceEstimate": 123.45,
                  "confidenceScore": 0.85,
                  "reasoning": "Brief explanation based on budget, weather, and comfort"
                }
                """.replace("{source}", source)
                  .replace("{destination}", destination)
                  .replace("{passengers}", String.valueOf(passengers))
                  .replace("{budget}", String.valueOf(budget))
                  .replace("{comfortLevel}", comfortLevel)
                  .replace("{sourceWeather}", sourceWeather)
                  .replace("{destWeather}", destWeather);
            
            SystemMessage systemMessage = new SystemMessage("You are a travel planning expert. Provide practical travel mode recommendations based on budget, weather, and comfort preferences.");
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
            // Try to parse as JSON first
            return objectMapper.readValue(response, Map.class);
        } catch (Exception e) {
            // If JSON parsing fails, extract information from text
            return extractFromText(response);
        }
    }

    private Map<String, Object> extractFromText(String response) {
        String recommendedMode = "car";
        double distanceEstimate = 250.0;
        double confidenceScore = 0.8;
        String reasoning = "Based on your travel preferences";

        // Simple text analysis
        if (response.toLowerCase().contains("train")) recommendedMode = "train";
        if (response.toLowerCase().contains("bus")) recommendedMode = "bus";
        if (response.toLowerCase().contains("flight") || response.toLowerCase().contains("plane")) recommendedMode = "flight";

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

        if (budget > 1000) {
            recommendedMode = "flight";
            distanceEstimate = 800.0;
            confidenceScore = 0.9;
            reasoning = "Budget allows for comfortable air travel";
        } else if (budget > 300) {
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