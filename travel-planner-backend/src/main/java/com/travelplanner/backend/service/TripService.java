package com.travelplanner.backend.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.Entities.ChatHistory;
import com.travelplanner.backend.Entities.Trip;
import com.travelplanner.backend.Entities.User;
import com.travelplanner.backend.dto.PlaceRecommendationResponse;
import com.travelplanner.backend.dto.TripRequest;
import com.travelplanner.backend.dto.WeatherAnalysis;
import com.travelplanner.backend.repository.TripRepository;

@Service
public class TripService {
    
    private static final Logger log = LoggerFactory.getLogger(TripService.class);
    
    private final TripRepository tripRepository;
    private final UserService userService;
    private final GeocodingService geocodingService;
    private final WeatherService weatherService;
    private final AIRecommendationService aiRecommendationService;
    private final PlaceRecommendationService placeRecommendationService;
    private final ChatService chatService;
    
    public TripService(TripRepository tripRepository, UserService userService,
            GeocodingService geocodingService, WeatherService weatherService,
            AIRecommendationService aiRecommendationService, FamousPlaceService famousPlaceService,
            PlaceRecommendationService placeRecommendationService,
            ChatService chatService) {
        this.tripRepository = tripRepository;
        this.userService = userService;
        this.geocodingService = geocodingService;
        this.weatherService = weatherService;
        this.aiRecommendationService = aiRecommendationService;
        this.placeRecommendationService = placeRecommendationService;
        this.chatService = chatService;
    }

    public Trip createTrip(TripRequest request, String username) {
        try {
            User user = userService.findByUsername(username);
            
            log.info("Creating trip for user: {} from {} to {}", username, request.getSourceCity(), request.getDestinationCity());
            
            // Get coordinates for source and destination
            Map<String, Double> sourceCoords = geocodingService.getCoordinates(request.getSourceCity())
                    .doOnError(error -> log.warn("Geocoding failed for source city: {}, using fallback", request.getSourceCity()))
                    .block();
            
            Map<String, Double> destCoords = geocodingService.getCoordinates(request.getDestinationCity())
                    .doOnError(error -> log.warn("Geocoding failed for destination city: {}, using fallback", request.getDestinationCity()))
                    .block();
            
            // Get weather data
            WeatherAnalysis sourceWeather = weatherService.getWeatherAnalysis(
                sourceCoords.get("lat"), sourceCoords.get("lng")
            ).doOnError(error -> log.warn("Weather API failed for source, using default"))
             .onErrorReturn(getDefaultWeatherAnalysis())
             .block();

            WeatherAnalysis destWeather = weatherService.getWeatherAnalysis(
                destCoords.get("lat"), destCoords.get("lng")
            ).doOnError(error -> log.warn("Weather API failed for destination, using default"))
             .onErrorReturn(getDefaultWeatherAnalysis())
             .block();

            // Get AI recommendations
            Map<String, Object> recommendations = aiRecommendationService.getTravelRecommendation(
                request.getSourceCity(), request.getDestinationCity(),
                request.getPassengers(), request.getBudget(),
                request.getComfortLevel().name(), 
                sourceWeather.getCondition(), 
                destWeather.getCondition()
            );
            
            // ✅ NEW: Store trip planning in ChatHistory
            String tripPlanningMessage = buildTripPlanningMessage(request, sourceWeather, destWeather, recommendations);
            String conversationId = "trip_" + System.currentTimeMillis();
            
            ChatHistory tripChat = chatService.processMessage(tripPlanningMessage, username, conversationId);
            
            // ✅ NEW: Store place recommendations in chat history
            String placeRecommendationPrompt = buildPlaceRecommendationPrompt(request);
            ChatHistory placeChat = chatService.processMessage(placeRecommendationPrompt, username, conversationId);

            Trip trip = new Trip();
            trip.setUser(user);
            trip.setSourceCity(request.getSourceCity());
            trip.setDestinationCity(request.getDestinationCity());
            trip.setSourceLat(sourceCoords.get("lat"));
            trip.setSourceLng(sourceCoords.get("lng"));
            trip.setDestLat(destCoords.get("lat"));
            trip.setDestLng(destCoords.get("lng"));
            trip.setPassengers(request.getPassengers());
            trip.setBudget(request.getBudget());
            trip.setComfortLevel(request.getComfortLevel());
            trip.setRecommendedMode((String) recommendations.get("recommendedMode"));
            
            // Handle both Integer and Double for distance
            Object distanceObj = recommendations.get("distanceEstimate");
            if (distanceObj instanceof Integer) {
                trip.setDistanceEstimate(((Integer) distanceObj).doubleValue());
            } else {
                trip.setDistanceEstimate((Double) distanceObj);
            }
            
            // Handle both Integer and Double for confidence score
            Object confidenceObj = recommendations.get("confidenceScore");
            if (confidenceObj instanceof Integer) {
                trip.setConfidenceScore(((Integer) confidenceObj).doubleValue());
            } else {
                trip.setConfidenceScore((Double) confidenceObj);
            }
            
            // Set weather info
            trip.setSourceWeather("Temp: " + sourceWeather.getTemperature() + "°C, " + 
                                 sourceWeather.getCondition() + ", Wind: " + 
                                 sourceWeather.getWindSpeed() + " km/h");
                                 
            trip.setDestinationWeather("Temp: " + destWeather.getTemperature() + "°C, " + 
                                      destWeather.getCondition() + ", Wind: " + 
                                      destWeather.getWindSpeed() + " km/h");

            // Get AI-curated place recommendations
            PlaceRecommendationResponse placeRecommendations = 
                placeRecommendationService.getAIRecommendedPlaces(
                    request.getDestinationCity(),
                    request.getInterests(),
                    request.getTripDuration(),
                    request.getBudget(),
                    request.getPassengers() + " passengers"
                );
            
            trip.setRecommendedPlaces(placeRecommendations.getRecommendedPlaces());
            
            // ✅ ADD THIS: Store conversation ID
            trip.setConversationId(conversationId);
            
            Trip savedTrip = tripRepository.save(trip);
            log.info("Trip created successfully with ID: {} and conversation: {}", savedTrip.getId(), conversationId);
            
            return savedTrip;
            
        } catch (Exception e) {
            log.error("Error creating trip for user: {}", username, e);
            throw new RuntimeException("Failed to create trip: " + e.getMessage());
        }
    }

    // ✅ ADD THIS MISSING METHOD
    private WeatherAnalysis getDefaultWeatherAnalysis() {
        WeatherAnalysis analysis = new WeatherAnalysis();
        analysis.setTemperature(20.0);
        analysis.setWindSpeed(10.0);
        analysis.setWeatherCode(0);
        analysis.setCondition("Clear sky");
        analysis.setTravelAdvisory("Weather service unavailable");
        analysis.setSafetyScore(85.0);
        analysis.setSuitableForTravel(true);
        return analysis;
    }

    public List<Trip> getUserTrips(String username) {
        return tripRepository.findByUserUsername(username);
    }

    public Trip getUserTrip(Long tripId, String username) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        
        if (!trip.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Access denied");
        }
        
        return trip;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }
    
 // ✅ ADD THESE HELPER METHODS TO TripService.java
    private String buildTripPlanningMessage(TripRequest request, WeatherAnalysis sourceWeather, 
                                           WeatherAnalysis destWeather, Map<String, Object> recommendations) {
        return String.format("""
            Plan a trip from %s to %s:
            - Passengers: %d
            - Budget: $%.2f
            - Comfort Level: %s
            - Source Weather: %s (%.1f°C)
            - Destination Weather: %s (%.1f°C)
            - Recommended Mode: %s
            - Distance: %.1f km
            """, 
            request.getSourceCity(), request.getDestinationCity(),
            request.getPassengers(), request.getBudget(), request.getComfortLevel(),
            sourceWeather.getCondition(), sourceWeather.getTemperature(),
            destWeather.getCondition(), destWeather.getTemperature(),
            recommendations.get("recommendedMode"), 
            recommendations.get("distanceEstimate"));
    }

    private String buildPlaceRecommendationPrompt(TripRequest request) {
        return String.format("""
            Recommend specific places to visit in %s for:
            - Interests: %s
            - Duration: %d days
            - Budget: $%.2f
            - Travelers: %d passengers
            Provide specific place names, daily itinerary, and cost estimates.
            """,
            request.getDestinationCity(), 
            request.getInterests() != null ? String.join(", ", request.getInterests()) : "general",
            request.getTripDuration() != null ? request.getTripDuration() : 3,
            request.getBudget(),
            request.getPassengers());
    }
    
}