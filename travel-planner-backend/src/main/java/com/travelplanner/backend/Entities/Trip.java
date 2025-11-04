package com.travelplanner.backend.Entities;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "trips")
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"trips", "chatHistories", "password"})
    private User user;

    private String sourceCity;
    private String destinationCity;
    
    private Double sourceLat;
    private Double sourceLng;
    private Double destLat;
    private Double destLng;
    
    private Integer passengers;
    private Double budget;
    
    @Enumerated(EnumType.STRING)
    private ComfortLevel comfortLevel;
    
    private String recommendedMode;
    private Double distanceEstimate;
    private Double confidenceScore;
    
    private String sourceWeather;
    private String destinationWeather;
    
    private LocalDateTime createdAt;
    
    // ✅ ADD THIS FIELD
    private String conversationId;
        
    // ✅ ADD GETTER AND SETTER
    public String getConversationId() { 
        return conversationId; 
    }
    
    public void setConversationId(String conversationId) { 
        this.conversationId = conversationId; 
    }
    
    @ManyToMany
    @JoinTable(
        name = "trip_recommended_places",
        joinColumns = @JoinColumn(name = "trip_id"),
        inverseJoinColumns = @JoinColumn(name = "place_id")
    )
    private List<FamousPlace> recommendedPlaces;

    // Constructors
    public Trip() {}
    
    public Trip(User user, String sourceCity, String destinationCity, Integer passengers, 
                Double budget, ComfortLevel comfortLevel) {
        this.user = user;
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.passengers = passengers;
        this.budget = budget;
        this.comfortLevel = comfortLevel;
    }

    // Keep ALL your manual getters/setters (they're perfectly written!)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }
    
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    
    public Double getSourceLat() { return sourceLat; }
    public void setSourceLat(Double sourceLat) { this.sourceLat = sourceLat; }
    
    public Double getSourceLng() { return sourceLng; }
    public void setSourceLng(Double sourceLng) { this.sourceLng = sourceLng; }
    
    public Double getDestLat() { return destLat; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }
    
    public Double getDestLng() { return destLng; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }
    
    public Integer getPassengers() { return passengers; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; }
    
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    
    public ComfortLevel getComfortLevel() { return comfortLevel; }
    public void setComfortLevel(ComfortLevel comfortLevel) { this.comfortLevel = comfortLevel; }
    
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
    
    public List<FamousPlace> getRecommendedPlaces() { return recommendedPlaces; }
    public void setRecommendedPlaces(List<FamousPlace> recommendedPlaces) { this.recommendedPlaces = recommendedPlaces; }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum ComfortLevel {
        ECONOMY, COMFORT, LUXURY
    }
}