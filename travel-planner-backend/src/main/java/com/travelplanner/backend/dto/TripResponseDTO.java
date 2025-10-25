package com.travelplanner.backend.dto;

import com.travelplanner.backend.Entities.Trip;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class TripResponseDTO {
    private Long id;
    private String sourceCity;
    private String destinationCity;
    private Integer passengers;
    private Double budget;
    private String comfortLevel;
    private String recommendedMode;
    private Double distanceEstimate;
    private Double confidenceScore;
    private String sourceWeather;
    private String destinationWeather;
    private LocalDateTime createdAt;
    private String username;
    private List<PlaceSummaryDTO> recommendedPlaces;
    
    private String conversationId;
    private boolean hasChatHistory;
    
    // Constructor from Trip entity
    public TripResponseDTO(Trip trip) {
        this.id = trip.getId();
        this.sourceCity = trip.getSourceCity();
        this.destinationCity = trip.getDestinationCity();
        this.passengers = trip.getPassengers();
        this.budget = trip.getBudget();
        this.comfortLevel = trip.getComfortLevel().name();
        this.recommendedMode = trip.getRecommendedMode();
        this.distanceEstimate = trip.getDistanceEstimate();
        this.confidenceScore = trip.getConfidenceScore();
        this.sourceWeather = trip.getSourceWeather();
        this.destinationWeather = trip.getDestinationWeather();
        this.createdAt = trip.getCreatedAt();
        this.username = trip.getUser().getUsername();
        this.conversationId = trip.getConversationId();
        this.hasChatHistory = trip.getConversationId() != null;
        
        // Safe conversion of places
        if (trip.getRecommendedPlaces() != null) {
            this.recommendedPlaces = trip.getRecommendedPlaces().stream()
                .map(PlaceSummaryDTO::new)
                .collect(Collectors.toList());
        }
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    public Integer getPassengers() { return passengers; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; }
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    public String getComfortLevel() { return comfortLevel; }
    public void setComfortLevel(String comfortLevel) { this.comfortLevel = comfortLevel; }
    public String getRecommendedMode() { return recommendedMode; }
    public void setRecommendedMode(String recommendedMode) { this.recommendedMode = recommendedMode; }
    public Double getDistanceEstimate() { return distanceEstimate; }
    public void setDistanceEstimate(Double distanceEstimate) { this.distanceEstimate = distanceEstimate; }
    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
    public String getSourceWeather() { return sourceWeather; }
    public void setSourceWeather(String sourceWeather) { this.sourceWeather = sourceWeather; }
    public String getDestinationWeather() { return destinationWeather; }
    public void setDestinationWeather(String destinationWeather) { this.destinationWeather = destinationWeather; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<PlaceSummaryDTO> getRecommendedPlaces() { return recommendedPlaces; }
    public void setRecommendedPlaces(List<PlaceSummaryDTO> recommendedPlaces) { this.recommendedPlaces = recommendedPlaces; }
    
    public String getConversationId() { 
        return conversationId; 
    }
    
    public void setConversationId(String conversationId) { 
        this.conversationId = conversationId; 
    }
    
    public boolean isHasChatHistory() { 
        return hasChatHistory; 
    }
    
    public void setHasChatHistory(boolean hasChatHistory) { 
        this.hasChatHistory = hasChatHistory; 
    }
}