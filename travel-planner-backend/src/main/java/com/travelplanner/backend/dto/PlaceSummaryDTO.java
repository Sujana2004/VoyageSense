package com.travelplanner.backend.dto;

import com.travelplanner.backend.Entities.FamousPlace;

public class PlaceSummaryDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private Double rating;
    private String city;
    private String imageUrl;
    private Double entryFee;
    
    public PlaceSummaryDTO() {}
    
    public PlaceSummaryDTO(FamousPlace place) {
        this.id = place.getId();
        this.name = place.getName();
        this.description = place.getDescription();
        this.category = place.getCategory();
        this.rating = place.getRating();
        this.city = place.getCity();
        this.imageUrl = place.getImageUrl();
        this.entryFee = place.getEntryFee();
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Double getEntryFee() { return entryFee; }
    public void setEntryFee(Double entryFee) { this.entryFee = entryFee; }
}