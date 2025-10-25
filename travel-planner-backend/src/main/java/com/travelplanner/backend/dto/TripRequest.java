package com.travelplanner.backend.dto;

import java.util.List;

import com.travelplanner.backend.Entities.Trip;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TripRequest {
    @NotBlank(message = "Source city is required")
    private String sourceCity;
    
    @NotBlank(message = "Destination city is required")
    private String destinationCity;
    
    @Min(value = 1, message = "At least 1 passenger is required")
    private Integer passengers;
    
    @Min(value = 0, message = "Budget cannot be negative")
    private Double budget;
    
    @NotNull(message = "Comfort level is required")
    private Trip.ComfortLevel comfortLevel;
    
    // New fields for enhanced planning
    private List<String> interests; // e.g., "historical, nature, food"
    private Integer tripDuration; // in days

    // Constructors
    public TripRequest() {}
    
    public TripRequest(String sourceCity, String destinationCity, Integer passengers, 
                      Double budget, Trip.ComfortLevel comfortLevel) {
        this.sourceCity = sourceCity;
        this.destinationCity = destinationCity;
        this.passengers = passengers;
        this.budget = budget;
        this.comfortLevel = comfortLevel;
    }

    // Getters and Setters
    public String getSourceCity() { return sourceCity; }
    public void setSourceCity(String sourceCity) { this.sourceCity = sourceCity; }
    
    public String getDestinationCity() { return destinationCity; }
    public void setDestinationCity(String destinationCity) { this.destinationCity = destinationCity; }
    
    public Integer getPassengers() { return passengers; }
    public void setPassengers(Integer passengers) { this.passengers = passengers; }
    
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    
    public Trip.ComfortLevel getComfortLevel() { return comfortLevel; }
    public void setComfortLevel(Trip.ComfortLevel comfortLevel) { this.comfortLevel = comfortLevel; }
    
    
    
    public List<String> getInterests() {
		return interests;
	}

	public void setInterests(List<String> interests) {
		this.interests = interests;
	}

	public Integer getTripDuration() { return tripDuration; }
    public void setTripDuration(Integer tripDuration) { this.tripDuration = tripDuration; }
}