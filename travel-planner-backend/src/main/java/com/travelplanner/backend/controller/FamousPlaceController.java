package com.travelplanner.backend.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.travelplanner.backend.Entities.FamousPlace;
import com.travelplanner.backend.dto.PlaceRecommendationResponse;
import com.travelplanner.backend.service.FamousPlaceService;
import com.travelplanner.backend.service.PlaceRecommendationService;

@RestController
@RequestMapping("/api/places")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class FamousPlaceController {
    
	private final FamousPlaceService famousPlaceService;
    private final PlaceRecommendationService recommendationService;

    public FamousPlaceController(FamousPlaceService famousPlaceService, 
                               PlaceRecommendationService recommendationService) {
        this.famousPlaceService = famousPlaceService;
        this.recommendationService = recommendationService;
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<FamousPlace>> getPlacesByCity(@PathVariable String city) {
        return ResponseEntity.ok(famousPlaceService.getPlacesByCity(city));
    }

    @GetMapping("/city/{city}/category/{category}")
    public ResponseEntity<List<FamousPlace>> getPlacesByCityAndCategory(
            @PathVariable String city, 
            @PathVariable String category) {
        return ResponseEntity.ok(famousPlaceService.getPlacesByCityAndCategory(city, category));
    }

    @GetMapping("/city/{city}/top-rated")
    public ResponseEntity<List<FamousPlace>> getTopRatedPlaces(@PathVariable String city) {
        return ResponseEntity.ok(famousPlaceService.getTopRatedPlacesInCity(city));
    }

    @GetMapping
    public ResponseEntity<List<FamousPlace>> getAllPlaces() {
        return ResponseEntity.ok(famousPlaceService.getAllPlaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FamousPlace> getPlaceById(@PathVariable Long id) {
        return ResponseEntity.ok(famousPlaceService.getPlaceById(id));
    }
    
    @GetMapping("/ai-recommendations")
    public ResponseEntity<PlaceRecommendationResponse> getAIRecommendations(
            @RequestParam String city,
            @RequestParam(required = false) List<String> interests,
            @RequestParam(required = false, defaultValue = "3") int duration,
            @RequestParam(required = false, defaultValue = "500") double budget,
            @RequestParam(required = false, defaultValue = "solo") String companions) {
        
        PlaceRecommendationResponse recommendations = 
            recommendationService.getAIRecommendedPlaces(city, interests, duration, budget, companions);
        
        return ResponseEntity.ok(recommendations);
    }
    
 // ✅ NEW PAGINATION ENDPOINTS
    @GetMapping("/city/{city}/paginated")
    public ResponseEntity<Page<FamousPlace>> getPlacesByCityPaginated(
            @PathVariable String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(famousPlaceService.getPlacesByCityPaginated(city, pageable));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<FamousPlace>> getAllPlacesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(famousPlaceService.getAllPlacesPaginated(pageable));
    }
    
}