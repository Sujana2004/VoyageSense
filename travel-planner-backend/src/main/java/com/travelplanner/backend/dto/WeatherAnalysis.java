package com.travelplanner.backend.dto;

public class WeatherAnalysis {
    private double temperature;
    private double windSpeed;
    private int weatherCode;
    private String condition;
    private String travelAdvisory;
    private double safetyScore;
    private boolean suitableForTravel;
	public double getTemperature() {
		return temperature;
	}
	public void setTemperature(double temperature) {
		this.temperature = temperature;
	}
	public double getWindSpeed() {
		return windSpeed;
	}
	public void setWindSpeed(double windSpeed) {
		this.windSpeed = windSpeed;
	}
	public int getWeatherCode() {
		return weatherCode;
	}
	public void setWeatherCode(int weatherCode) {
		this.weatherCode = weatherCode;
	}
	public String getCondition() {
		return condition;
	}
	public void setCondition(String condition) {
		this.condition = condition;
	}
	public String getTravelAdvisory() {
		return travelAdvisory;
	}
	public void setTravelAdvisory(String travelAdvisory) {
		this.travelAdvisory = travelAdvisory;
	}
	public double getSafetyScore() {
		return safetyScore;
	}
	public void setSafetyScore(double safetyScore) {
		this.safetyScore = safetyScore;
	}
	public boolean isSuitableForTravel() {
		return suitableForTravel;
	}
	public void setSuitableForTravel(boolean suitableForTravel) {
		this.suitableForTravel = suitableForTravel;
	}
	public WeatherAnalysis(double temperature, double windSpeed, int weatherCode, String condition,
			String travelAdvisory, double safetyScore, boolean suitableForTravel) {
		super();
		this.temperature = temperature;
		this.windSpeed = windSpeed;
		this.weatherCode = weatherCode;
		this.condition = condition;
		this.travelAdvisory = travelAdvisory;
		this.safetyScore = safetyScore;
		this.suitableForTravel = suitableForTravel;
	}
	public WeatherAnalysis() {
		super();
		// TODO Auto-generated constructor stub
	}
   
    
    
}
