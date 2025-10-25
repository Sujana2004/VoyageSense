package com.travelplanner.backend.dto;

import com.travelplanner.backend.Entities.FamousPlace;
import java.util.List;

public class PlaceRecommendationResponse {
    private List<FamousPlace> recommendedPlaces;
    private List<DailyItinerary> dailyItinerary;
    private Double totalCostEstimate;
    private String reasoning;

    // Constructors
    public PlaceRecommendationResponse() {}
    
    public PlaceRecommendationResponse(List<FamousPlace> recommendedPlaces, String reasoning) {
        this.recommendedPlaces = recommendedPlaces;
        this.reasoning = reasoning;
    }

    // Getters and Setters
    public List<FamousPlace> getRecommendedPlaces() {
        return recommendedPlaces;
    }

    public void setRecommendedPlaces(List<FamousPlace> recommendedPlaces) {
        this.recommendedPlaces = recommendedPlaces;
    }

    public List<DailyItinerary> getDailyItinerary() {
        return dailyItinerary;
    }

    public void setDailyItinerary(List<DailyItinerary> dailyItinerary) {
        this.dailyItinerary = dailyItinerary;
    }

    public Double getTotalCostEstimate() {
        return totalCostEstimate;
    }

    public void setTotalCostEstimate(Double totalCostEstimate) {
        this.totalCostEstimate = totalCostEstimate;
    }

    public String getReasoning() {
        return reasoning;
    }

    public void setReasoning(String reasoning) {
        this.reasoning = reasoning;
    }

    public static class DailyItinerary {
        private Integer day;
        private List<String> places;
        private String description;

        // Constructors
        public DailyItinerary() {}
        
        public DailyItinerary(Integer day, List<String> places, String description) {
            this.day = day;
            this.places = places;
            this.description = description;
        }

        // Getters and Setters
        public Integer getDay() {
            return day;
        }

        public void setDay(Integer day) {
            this.day = day;
        }

        public List<String> getPlaces() {
            return places;
        }

        public void setPlaces(List<String> places) {
            this.places = places;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}