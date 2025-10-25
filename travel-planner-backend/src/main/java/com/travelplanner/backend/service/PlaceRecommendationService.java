package com.travelplanner.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.Entities.FamousPlace;
import com.travelplanner.backend.dto.PlaceRecommendationResponse;

@Service
public class PlaceRecommendationService {
    
    private final FamousPlaceService famousPlaceService;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public PlaceRecommendationService(FamousPlaceService famousPlaceService, 
    								ChatModel chatModel, 
                                     ObjectMapper objectMapper) {
        this.famousPlaceService = famousPlaceService;
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    public PlaceRecommendationResponse getAIRecommendedPlaces(
            String destinationCity, 
            List<String> userInterests, 
            int tripDuration, 
            double budget,
            String travelCompanions) {
        
        List<FamousPlace> cityPlaces = famousPlaceService.getPlacesByCity(destinationCity);
        
        if (cityPlaces.isEmpty()) {
            return getFallbackRecommendation(destinationCity);
        }

        String placesContext = buildPlacesContext(cityPlaces);
        
        String promptText = """
            You are an expert travel guide. Recommend places to visit based on:
            Destination: %s
            User Interests: %s
            Trip Duration: %d days
            Budget: $%.2f
            Travel Companions: %s
            
            Available places in the city:
            %s
            
            Provide recommendations in this exact JSON format:
            {
              "recommendedPlaces": ["Place Name 1", "Place Name 2", ...],
              "dailyItinerary": [
                {"day": 1, "places": ["Place A", "Place B"], "description": "Day 1 plan"},
                {"day": 2, "places": ["Place C", "Place D"], "description": "Day 2 plan"}
              ],
              "totalCostEstimate": 150.00,
              "reasoning": "Why these places were chosen based on interests and constraints"
            }
            """.formatted(destinationCity, userInterests, tripDuration, budget, travelCompanions, placesContext);

        try {
        	// ✅ Updated to use ChatModel instead of ChatClient
            SystemMessage systemMessage = new SystemMessage("You are a helpful travel planning assistant. Provide practical, budget-aware travel recommendations in valid JSON format.");
            UserMessage userMessage = new UserMessage(promptText);
            Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
            
            String aiResponse = chatModel.call(prompt).getResult().getOutput().getText();
            
            return parseAIResponse(aiResponse, cityPlaces);
            
        } catch (Exception e) {
            return getFallbackRecommendation(destinationCity);
        }
    }

    private String buildPlacesContext(List<FamousPlace> places) {
        return places.stream()
                .map(place -> String.format(
                    "- %s (%s): $%.2f entry, %d hours, Rating: %.1f/5 - %s",
                    place.getName(), place.getCategory(), place.getEntryFee(),
                    place.getRecommendedDuration(), place.getRating(), place.getDescription()
                ))
                .collect(Collectors.joining("\n"));
    }

    @SuppressWarnings("unchecked")
    private PlaceRecommendationResponse parseAIResponse(String aiResponse, List<FamousPlace> allPlaces) {
        PlaceRecommendationResponse response = new PlaceRecommendationResponse();
        
        try {
            // ✅ TYPE SAFE: Use TypeReference for proper generic type preservation
            Map<String, Object> aiData = objectMapper.readValue(
                aiResponse, 
                new TypeReference<Map<String, Object>>() {}
            );
            
            // Extract recommended places from JSON - TYPE SAFE
            if (aiData.containsKey("recommendedPlaces")) {
                Object recommendedPlacesObj = aiData.get("recommendedPlaces");
                if (recommendedPlacesObj instanceof List) {
                    List<?> recommendedPlaceNames = (List<?>) recommendedPlacesObj;
                    List<FamousPlace> recommended = allPlaces.stream()
                            .filter(place -> recommendedPlaceNames.stream()
                                    .anyMatch(name -> name.toString().toLowerCase()
                                            .contains(place.getName().toLowerCase())))
                            .collect(Collectors.toList());
                    response.setRecommendedPlaces(recommended);
                }
            }
            
            // Extract daily itinerary from JSON - TYPE SAFE
            if (aiData.containsKey("dailyItinerary")) {
                Object dailyItineraryObj = aiData.get("dailyItinerary");
                if (dailyItineraryObj instanceof List) {
                    List<?> dailyItineraryData = (List<?>) dailyItineraryObj;
                    List<PlaceRecommendationResponse.DailyItinerary> dailyItinerary = dailyItineraryData.stream()
                            .map(dayObj -> {
                                if (dayObj instanceof Map) {
                                    Map<?, ?> dayData = (Map<?, ?>) dayObj;
                                    PlaceRecommendationResponse.DailyItinerary itinerary = new PlaceRecommendationResponse.DailyItinerary();
                                    
                                    // Safe day extraction
                                    Object dayObjValue = dayData.get("day");
                                    if (dayObjValue instanceof Number) {
                                        itinerary.setDay(((Number) dayObjValue).intValue());
                                    }
                                    
                                    // Safe places extraction
                                    Object placesObj = dayData.get("places");
                                    if (placesObj instanceof List) {
                                        List<String> places = ((List<?>) placesObj).stream()
                                                .map(Object::toString)
                                                .collect(Collectors.toList());
                                        itinerary.setPlaces(places);
                                    }
                                    
                                    // Safe description extraction
                                    Object descObj = dayData.get("description");
                                    if (descObj instanceof String) {
                                        itinerary.setDescription((String) descObj);
                                    }
                                    
                                    return itinerary;
                                }
                                return null;
                            })
                            .filter(itinerary -> itinerary != null)
                            .collect(Collectors.toList());
                    response.setDailyItinerary(dailyItinerary);
                }
            }
            
            // Extract other fields - TYPE SAFE
            if (aiData.containsKey("totalCostEstimate")) {
                Object costObj = aiData.get("totalCostEstimate");
                if (costObj instanceof Number) {
                    response.setTotalCostEstimate(((Number) costObj).doubleValue());
                }
            }
            
            if (aiData.containsKey("reasoning")) {
                Object reasoningObj = aiData.get("reasoning");
                if (reasoningObj instanceof String) {
                    response.setReasoning((String) reasoningObj);
                }
            }
            
            // Set default reasoning if none provided
            if (response.getReasoning() == null) {
                response.setReasoning("AI-curated itinerary based on your preferences");
            }
            
        } catch (Exception e) {
            // Fallback: Simple text parsing if JSON parsing fails
            return parseAIResponseFromText(aiResponse, allPlaces);
        }
        
        return response;
    }

    private PlaceRecommendationResponse parseAIResponseFromText(String aiResponse, List<FamousPlace> allPlaces) {
        // Fallback parsing: Extract place names from text
        PlaceRecommendationResponse response = new PlaceRecommendationResponse();
        
        List<FamousPlace> recommended = allPlaces.stream()
                .filter(place -> aiResponse.toLowerCase().contains(place.getName().toLowerCase()))
                .collect(Collectors.toList());
        
        response.setRecommendedPlaces(recommended);
        response.setReasoning("AI-curated based on your preferences and constraints (text analysis)");
        
        return response;
    }

    private PlaceRecommendationResponse getFallbackRecommendation(String city) {
        // Fallback: return top-rated places
        List<FamousPlace> topRated = famousPlaceService.getTopRatedPlacesInCity(city);
        PlaceRecommendationResponse response = new PlaceRecommendationResponse();
        response.setRecommendedPlaces(topRated);
        response.setReasoning("Top-rated places in " + city);
        return response;
    }
}