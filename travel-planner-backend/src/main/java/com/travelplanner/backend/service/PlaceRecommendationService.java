package com.travelplanner.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.Entities.FamousPlace;
import com.travelplanner.backend.dto.PlaceRecommendationResponse;
import com.travelplanner.backend.repository.FamousPlaceRepository;

@Service
public class PlaceRecommendationService {
	
	private static final Logger log = LoggerFactory.getLogger(PlaceRecommendationService.class);
    
    private final FamousPlaceService famousPlaceService;
    private final FamousPlaceRepository famousPlaceRepository; 
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    public PlaceRecommendationService(FamousPlaceService famousPlaceService,
                                     FamousPlaceRepository famousPlaceRepository, 
                                     ChatModel chatModel, 
                                     ObjectMapper objectMapper) {
        this.famousPlaceService = famousPlaceService;
        this.famousPlaceRepository = famousPlaceRepository; 
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
    }

    @Transactional  
    public PlaceRecommendationResponse getAIRecommendedPlaces(
            String destinationCity, 
            List<String> userInterests, 
            int tripDuration, 
            double budget,
            String travelCompanions) {
        
        List<FamousPlace> cityPlaces = famousPlaceService.getPlacesByCity(destinationCity);
        
        // Build context from existing places if any
        String placesContext = cityPlaces.isEmpty() ? 
            "No places in database yet. Suggest popular attractions." :
            buildPlacesContext(cityPlaces);
        
        String promptText = """
            [TRAVEL GUIDE FOR %s]
            INTERESTS: %s | DURATION: %d days | BUDGET: ₹%.2f | COMPANIONS: %s
            
            CONTEXT: %s
            
            RETURN ONLY VALID JSON (no other text):
            {
              "recommendedPlaces": [
                {
                  "name": "Specific Place Name",
                  "description": "Brief practical description",
                  "category": "Historical/Nature/Beach/Shopping/Food/Nightlife/Relaxation/Adventure/Religious",
                  "estimatedCost": 100.00,
                  "recommendedDuration": 2
                }
              ],
              "dailyItinerary": [
                {
                  "day": 1,
                  "places": ["Place A", "Place B"],
                  "description": "Practical day plan"
                }
              ],
              "totalCostEstimate": 500.00,
              "reasoning": "Concise matching explanation"
            }
            """.formatted(destinationCity, 
                         userInterests != null ? String.join(", ", userInterests): "general sightseeing", 
                         tripDuration, 
                         budget, 
                         travelCompanions, 
                         placesContext);

        try {
        	// OPTIMIZED SYSTEM PROMPT
            SystemMessage systemMessage = new SystemMessage("""
                You are a practical travel expert for Indian destinations.
			    CRITICAL: Return ONLY valid JSON, no other text or markdown.
			    IMPORTANT FORMAT RULES:
			    - JSON must start with { and end with }
			    - No ```json or ``` markers
			    - No additional explanations
			    - Use double quotes for all strings
			    - estimatedCost must be numbers (not strings)
			    - recommendedDuration must be integers
			    
			    Content guidelines:
			    - Suggest realistic, popular Indian places
			    - Use practical costs in Indian Rupees
			    - Keep descriptions brief and useful (max 20 words)
			    - recommendedDuration: realistic hours needed in count
			    - estimatedCost: realistic Indian entry fees in INR
			    - Be specific with place names
                """);
            UserMessage userMessage = new UserMessage(promptText);
            Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
            
            String rawResponse = chatModel.call(prompt).getResult().getOutput().getText();
            String aiResponse = extractContentFromOpenAIResponse(rawResponse);
            log.info("Place AI Raw Response: {}", rawResponse);
            log.info("Place AI Extracted Content: {}", aiResponse);
            
            //  Parse and save places dynamically
            return parseAndSavePlaces(aiResponse, destinationCity);
            
        } catch (Exception e) {
        	log.error("Place recommendation failed: {}", e.getMessage());
            return getFallbackRecommendation(destinationCity);
        }
    }

    // Parse AI response and create FamousPlace entries
    @Transactional
    private PlaceRecommendationResponse parseAndSavePlaces(String aiResponse, String city) {
        PlaceRecommendationResponse response = new PlaceRecommendationResponse();
        
        try {
            // Clean AI response (remove markdown code blocks if present)
        	String cleanJson = extractJsonFromResponse(aiResponse);
            log.info("Cleaned place JSON: {}", cleanJson);
            
            if (cleanJson.equals("{}")) {
                log.warn("No JSON found in AI response, using text parsing");
                return parseAIResponseFromText(aiResponse, city);
            }
            
            Map<String, Object> aiData = objectMapper.readValue(
                cleanJson, 
                new TypeReference<Map<String, Object>>() {}
            );
            
            // Extract and create FamousPlace entities
            // Process recommendedPlaces
            if (aiData.containsKey("recommendedPlaces") && aiData.get("recommendedPlaces") instanceof List) {
                List<?> recommendedPlacesData = (List<?>) aiData.get("recommendedPlaces");
                List<FamousPlace> savedPlaces = recommendedPlacesData.stream()
                    .map(placeData -> {
                        if (placeData instanceof Map) {
                            Map<?, ?> placeMap = (Map<?, ?>) placeData;
                            return createOrUpdatePlace(placeMap, city);
                        }
                        return null;
                    })
                    .filter(place -> place != null)
                    .collect(Collectors.toList());
                
                response.setRecommendedPlaces(savedPlaces);
            }
            
            // Extract daily itinerary
            if (aiData.containsKey("dailyItinerary")) {
                List<?> dailyItineraryData = (List<?>) aiData.get("dailyItinerary");
                List<PlaceRecommendationResponse.DailyItinerary> dailyItinerary = dailyItineraryData.stream()
                    .map(dayObj -> {
                        if (dayObj instanceof Map) {
                            Map<?, ?> dayData = (Map<?, ?>) dayObj;
                            PlaceRecommendationResponse.DailyItinerary itinerary = 
                                new PlaceRecommendationResponse.DailyItinerary();
                            
                         // Safe extraction with defaults
                            itinerary.setDay(extractInt(dayData.get("day"), 1));
                            itinerary.setPlaces(extractStringList(dayData.get("places")));
                            itinerary.setDescription(extractString(dayData.get("description"), "Daily itinerary"));
                            
                            return itinerary;
                        }
                        return null;
                    })
                    .filter(itinerary -> itinerary != null)
                    .collect(Collectors.toList());
                response.setDailyItinerary(dailyItinerary);
            }
            
         // Extract other fields with safe defaults
            response.setTotalCostEstimate(extractDouble(aiData.get("totalCostEstimate"), budgetEstimate(response.getRecommendedPlaces())));
            response.setReasoning(extractString(aiData.get("reasoning"), "AI-curated itinerary for " + city));
            
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback to text parsing
            return parseAIResponseFromText(aiResponse, city);
        }
        
        return response;
    }
    
    private String extractJsonFromResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return "{}";
        }
        
        // Remove ALL markdown and extra text
        String cleaned = response.replaceAll("(?s)```json\\s*", "")  // Remove ```json
                               .replaceAll("```", "")               // Remove other ```
                               .replaceAll("^[^{]*", "")            // Remove everything before first {
                               .replaceAll("[^}]*$", "")            // Remove everything after last }
                               .trim();
        
        // Validate JSON structure
        if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
            try {
                // Test if it's valid JSON
                objectMapper.readTree(cleaned);
                return cleaned;
            } catch (Exception e) {
                log.warn("Invalid JSON structure: {}", cleaned);
            }
        }
        
        log.warn("No valid JSON found in response: {}", response.substring(0, Math.min(100, response.length())));
        return "{}";
    }
    
 // HELPER METHODS FOR SAFE DATA EXTRACTION
    private int extractInt(Object value, int defaultValue) {
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try { return Integer.parseInt((String) value); } 
            catch (NumberFormatException e) { return defaultValue; }
        }
        return defaultValue;
    }
    
    private double extractDouble(Object value, double defaultValue) {
        if (value instanceof Number) return ((Number) value).doubleValue();
        if (value instanceof String) {
            try { return Double.parseDouble((String) value); } 
            catch (NumberFormatException e) { return defaultValue; }
        }
        return defaultValue;
    }
    
    private String extractString(Object value, String defaultValue) {
        return value != null ? value.toString() : defaultValue;
    }
    
    private List<String> extractStringList(Object value) {
        if (value instanceof List) {
            return ((List<?>) value).stream()
                .map(Object::toString)
                .collect(Collectors.toList());
        }
        return new ArrayList<>();
    }
    
    private double budgetEstimate(List<FamousPlace> places) {
        if (places == null || places.isEmpty()) return 1000.0;
        return places.stream().mapToDouble(p -> p.getEntryFee() != null ? p.getEntryFee() : 0.0).sum();
    }

    // Create or update FamousPlace from AI data
    @Transactional
    private FamousPlace createOrUpdatePlace(Map<?, ?> placeData, String city) {
        try {
            String placeName = placeData.get("name").toString();
            
            // Check if place already exists
            List<FamousPlace> existingPlaces = famousPlaceRepository.findByCity(city);
            FamousPlace existingPlace = existingPlaces.stream()
                .filter(p -> p.getName().equalsIgnoreCase(placeName))
                .findFirst()
                .orElse(null);
            
            FamousPlace place = existingPlace != null ? existingPlace : new FamousPlace();
            
            place.setName(placeName);
            place.setCity(city);
            place.setCountry("India"); // Default, you can make this dynamic
            
            if (placeData.containsKey("description")) {
                place.setDescription(placeData.get("description").toString());
            }
            
            if (placeData.containsKey("category")) {
                place.setCategory(placeData.get("category").toString());
            }
            
            if (placeData.containsKey("estimatedCost")) {
                Object costObj = placeData.get("estimatedCost");
                if (costObj instanceof Number) {
                    place.setEntryFee(((Number) costObj).doubleValue());
                }
            }
            
            if (placeData.containsKey("recommendedDuration")) {
                Object durationObj = placeData.get("recommendedDuration");
                if (durationObj instanceof Number) {
                    place.setRecommendedDuration(((Number) durationObj).intValue());
                }
            }
            
            // Set default rating if not exists
            if (place.getRating() == null) {
                place.setRating(4.0);
            }
            
            // Set default coordinates (you can enhance this with geocoding)
            if (place.getLatitude() == null) {
                place.setLatitude(0.0);
                place.setLongitude(0.0);
            }
            
            return famousPlaceRepository.save(place);
            
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private String buildPlacesContext(List<FamousPlace> places) {
        return places.stream()
                .map(place -> String.format(
                    "- %s (%s): $%.2f entry, %d hours, Rating: %.1f/5",
                    place.getName(), 
                    place.getCategory(), 
                    place.getEntryFee(),
                    place.getRecommendedDuration(), 
                    place.getRating()
                ))
                .collect(Collectors.joining("\n"));
    }

    private PlaceRecommendationResponse parseAIResponseFromText(String aiResponse, String city) {
        // Fallback: Try to extract place names from text
        PlaceRecommendationResponse response = new PlaceRecommendationResponse();
        
        // Simple text parsing - look for common place names
        String[] commonPlaces = {"Beach", "Fort", "Temple", "Market", "Falls", "Church","Market","Food", "Museum"};
        
        for (String keyword : commonPlaces) {
            if (aiResponse.toLowerCase().contains(keyword.toLowerCase())) {
                FamousPlace place = new FamousPlace();
                place.setName(keyword + " in " + city);
                place.setDescription("Extracted from AI recommendation");
                place.setCity(city);
                place.setCountry("India");
                place.setCategory("General");
                place.setRating(4.0);
                place.setEntryFee(0.0);
                place.setRecommendedDuration(2);
                place.setLatitude(0.0);
                place.setLongitude(0.0);
                
                FamousPlace saved = famousPlaceRepository.save(place);
                response.setRecommendedPlaces(List.of(saved));
                break;
            }
        }
        
        response.setReasoning("AI-curated based on your preferences (text analysis)");
        return response;
    }

    private PlaceRecommendationResponse getFallbackRecommendation(String city) {
        PlaceRecommendationResponse response = new PlaceRecommendationResponse();
        List<FamousPlace> topRated = famousPlaceService.getTopRatedPlacesInCity(city);
        response.setRecommendedPlaces(topRated);
        response.setReasoning("Top-rated places in " + city);
        return response;
    }
    
    private String extractContentFromOpenAIResponse(String aiResponse) {
        try {
            // Parse the OpenAI response format
            Map<String, Object> responseMap = objectMapper.readValue(aiResponse, new TypeReference<Map<String, Object>>() {});
            
            // Extract content from choices[0].message.content
            if (responseMap.containsKey("choices") && responseMap.get("choices") instanceof List) {
                List<?> choices = (List<?>) responseMap.get("choices");
                if (!choices.isEmpty() && choices.get(0) instanceof Map) {
                    Map<?, ?> choice = (Map<?, ?>) choices.get(0);
                    if (choice.containsKey("message") && choice.get("message") instanceof Map) {
                        Map<?, ?> message = (Map<?, ?>) choice.get("message");
                        if (message.containsKey("content")) {
                            return message.get("content").toString();
                        }
                    }
                }
            }
            
            // Fallback: return original response
            return aiResponse;
        } catch (Exception e) {
            log.warn("Failed to parse OpenAI response format, using original response");
            return aiResponse;
        }
    }
}