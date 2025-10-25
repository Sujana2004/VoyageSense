package com.travelplanner.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.travelplanner.backend.dto.CurrentWeather;
import com.travelplanner.backend.dto.WeatherAnalysis;
import com.travelplanner.backend.dto.WeatherResponse;

import reactor.core.publisher.Mono;

@Service
public class WeatherService {
    
    private final WebClient webClient;

    public WeatherService(WebClient webClient) {
        this.webClient = webClient;
    }

    public Mono<WeatherAnalysis> getWeatherAnalysis(double lat, double lng) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("api.open-meteo.com")
                        .path("/v1/forecast")
                        .queryParam("latitude", lat)
                        .queryParam("longitude", lng)
                        .queryParam("current_weather", "true")
                        .queryParam("temperature_unit", "celsius")
                        .queryParam("timezone", "auto")
                        .build())
                .retrieve()
                .bodyToMono(WeatherResponse.class)
                .map(this::analyzeWeather)
                .onErrorReturn(getDefaultWeatherAnalysis());
    }
    
    private WeatherAnalysis getDefaultWeatherAnalysis() {
        WeatherAnalysis analysis = new WeatherAnalysis();
        analysis.setTemperature(20.0);
        analysis.setWindSpeed(10.0);
        analysis.setWeatherCode(0);
        analysis.setCondition("Clear sky");
        analysis.setTravelAdvisory("Weather service unavailable - using default data");
        analysis.setSafetyScore(85.0);
        analysis.setSuitableForTravel(true);
        return analysis;
    }

    private WeatherAnalysis analyzeWeather(WeatherResponse response) {
        CurrentWeather current = response.getCurrentWeather(); // ✅ Fixed
        WeatherAnalysis analysis = new WeatherAnalysis();
        
        analysis.setTemperature(current.getTemperature());
        analysis.setWindSpeed(current.getWindspeed()); // This will work with @JsonProperty
        analysis.setWeatherCode(current.getWeathercode()); // This will work with @JsonProperty
        analysis.setCondition(getWeatherCondition(current.getWeathercode()));
        analysis.setTravelAdvisory(getTravelAdvisory(current));
        analysis.setSafetyScore(calculateSafetyScore(current));
        analysis.setSuitableForTravel(isSuitableForTravel(current));
        
        return analysis;
    }

    private String getTravelAdvisory(CurrentWeather weather) {
        if (weather.getWindspeed() > 50) return "High winds - avoid travel";
        if (weather.getTemperature() < -10) return "Extreme cold - travel not recommended";
        if (weather.getWeathercode() > 80) return "Severe weather - postpone travel";
        return "Weather conditions are good for travel";
    }

    private double calculateSafetyScore(CurrentWeather weather) {
        double score = 100;
        if (weather.getWindspeed() > 30) score -= 30;
        if (weather.getTemperature() < -5 || weather.getTemperature() > 40) score -= 25;
        if (weather.getWeathercode() > 60) score -= 20;
        return Math.max(0, score);
    }

    private boolean isSuitableForTravel(CurrentWeather weather) {
        return calculateSafetyScore(weather) > 70;
    }

    private String getWeatherCondition(int weatherCode) {
        // Map weather codes to conditions
        if (weatherCode == 0) return "Clear sky";
        if (weatherCode <= 3) return "Partly cloudy";
        if (weatherCode <= 48) return "Foggy";
        if (weatherCode <= 67) return "Rainy";
        if (weatherCode <= 77) return "Snowy";
        if (weatherCode <= 99) return "Thunderstorm";
        return "Unknown";
    }
}