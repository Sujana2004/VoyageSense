package com.travelplanner.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class GeocodingService {
    
    private final WebClient webClient;

    public GeocodingService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<Map<String, Double>> getCoordinates(String city) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("nominatim.openstreetmap.org")
                        .path("/search")
                        .queryParam("q", city)
                        .queryParam("format", "json")
                        .queryParam("limit", 1)
                        .queryParam("addressdetails", 1)
                        .build())
                .retrieve()
                .bodyToMono(List.class) // Keep as List.class for dynamic JSON
                .map(response -> {
                    if (response != null && !response.isEmpty()) {
                        Map<String, Object> locationData = (Map<String, Object>) response.get(0);
                        
                        if (isValidCityMatch(city, locationData)) {
                            double lat = Double.parseDouble(locationData.get("lat").toString());
                            double lon = Double.parseDouble(locationData.get("lon").toString());
                            return Map.of("lat", lat, "lng", lon);
                        }
                    }
                    return getEnhancedFallbackCoordinates(city);
                })
                .onErrorReturn(getEnhancedFallbackCoordinates(city));
    }

    private boolean isValidCityMatch(String requestedCity, Map<String, Object> locationData) {
        try {
            Map<String, Object> address = (Map<String, Object>) locationData.get("address");
            String foundCity = (String) address.get("city");
            String foundTown = (String) address.get("town");
            String foundVillage = (String) address.get("village");
            
            String actualPlace = foundCity != null ? foundCity : 
                                foundTown != null ? foundTown : foundVillage;
            
            if (actualPlace != null) {
                return actualPlace.toLowerCase().contains(requestedCity.toLowerCase()) ||
                       requestedCity.toLowerCase().contains(actualPlace.toLowerCase());
            }
            return true;
        } catch (Exception e) {
            return true;
        }
    }

    private Map<String, Double> getEnhancedFallbackCoordinates(String city) {
        // Use HashMap for more than 10 entries
        Map<String, Map<String, Double>> fallbackCities = new HashMap<>();
        fallbackCities.put("new york", Map.of("lat", 40.7128, "lng", -74.0060));
        fallbackCities.put("london", Map.of("lat", 51.5074, "lng", -0.1278));
        fallbackCities.put("paris", Map.of("lat", 48.8566, "lng", 2.3522));
        fallbackCities.put("tokyo", Map.of("lat", 35.6762, "lng", 139.6503));
        fallbackCities.put("delhi", Map.of("lat", 28.6139, "lng", 77.2090));
        fallbackCities.put("mumbai", Map.of("lat", 19.0760, "lng", 72.8777));
        fallbackCities.put("bangalore", Map.of("lat", 12.9716, "lng", 77.5946));
        fallbackCities.put("hyderabad", Map.of("lat", 17.3850, "lng", 78.4867));
        fallbackCities.put("chennai", Map.of("lat", 13.0827, "lng", 80.2707));
        fallbackCities.put("kolkata", Map.of("lat", 22.5726, "lng", 88.3639));
        fallbackCities.put("san francisco", Map.of("lat", 37.7749, "lng", -122.4194));
        fallbackCities.put("dubai", Map.of("lat", 25.2048, "lng", 55.2708));
        fallbackCities.put("singapore", Map.of("lat", 1.3521, "lng", 103.8198));
        
        String cityLower = city.toLowerCase().trim();
        
        // Exact match first
        if (fallbackCities.containsKey(cityLower)) {
            return fallbackCities.get(cityLower);
        }
        
        // Then contains match
        for (Map.Entry<String, Map<String, Double>> entry : fallbackCities.entrySet()) {
            if (cityLower.contains(entry.getKey()) || entry.getKey().contains(cityLower)) {
                return entry.getValue();
            }
        }
        
        // Return a central location instead of always Delhi
        return Map.of("lat", 20.5937, "lng", 78.9629);
    }
}