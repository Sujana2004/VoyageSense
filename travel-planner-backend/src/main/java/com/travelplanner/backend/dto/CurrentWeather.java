package com.travelplanner.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CurrentWeather {
    private double temperature;
    
    @JsonProperty("windspeed")
    private double windspeed;
    
    @JsonProperty("winddirection")
    private double winddirection;
    
    @JsonProperty("weathercode")
    private int weathercode;
    
    private String time;
    
    @JsonProperty("is_day")
    private int isDay;

    public CurrentWeather() {}

    // Getters and Setters
    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getWindspeed() {
        return windspeed;
    }

    public void setWindspeed(double windspeed) {
        this.windspeed = windspeed;
    }

    public double getWinddirection() {
        return winddirection;
    }

    public void setWinddirection(double winddirection) {
        this.winddirection = winddirection;
    }

    public int getWeathercode() {
        return weathercode;
    }

    public void setWeathercode(int weathercode) {
        this.weathercode = weathercode;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public int getIsDay() {
        return isDay;
    }

    public void setIsDay(int isDay) {
        this.isDay = isDay;
    }
}