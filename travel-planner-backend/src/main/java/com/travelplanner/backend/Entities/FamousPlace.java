package com.travelplanner.backend.Entities;

import jakarta.persistence.*;

@Entity
@Table(name = "famous_places")
public class FamousPlace {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String city;
    private String country;
    
    private Double latitude;
    private Double longitude;
    
    private String category;
    private String imageUrl;
    private Double entryFee;
    private Integer recommendedDuration;
    private Double rating;
    
    @Column(columnDefinition = "TEXT")
    private String bestTimeToVisit;

    // Constructors
    public FamousPlace() {}
    
    public FamousPlace(String name, String description, String city, String country, 
                      Double latitude, Double longitude, String category) {
        this.name = name;
        this.description = description;
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public Double getEntryFee() {
		return entryFee;
	}

	public void setEntryFee(Double entryFee) {
		this.entryFee = entryFee;
	}

	public Integer getRecommendedDuration() {
		return recommendedDuration;
	}

	public void setRecommendedDuration(Integer recommendedDuration) {
		this.recommendedDuration = recommendedDuration;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public String getBestTimeToVisit() {
		return bestTimeToVisit;
	}

	public void setBestTimeToVisit(String bestTimeToVisit) {
		this.bestTimeToVisit = bestTimeToVisit;
	}
    
    
}