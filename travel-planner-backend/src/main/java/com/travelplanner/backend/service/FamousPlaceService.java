package com.travelplanner.backend.service;

import java.util.List;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.Entities.FamousPlace;
import com.travelplanner.backend.repository.FamousPlaceRepository;

@Service
public class FamousPlaceService {
    
    private final FamousPlaceRepository famousPlaceRepository;

    public FamousPlaceService(FamousPlaceRepository famousPlaceRepository) {
        this.famousPlaceRepository = famousPlaceRepository;
    }

    public List<FamousPlace> getPlacesByCity(String city) {
        return famousPlaceRepository.findByCity(city);
    }

    public List<FamousPlace> getPlacesByCityAndCategory(String city, String category) {
        return famousPlaceRepository.findByCityAndCategory(city, category);
    }

    public List<FamousPlace> getTopRatedPlacesInCity(String city) {
        return famousPlaceRepository.findTopRatedInCity(city, 4.0);
    }

    public List<FamousPlace> getAllPlaces() {
        return famousPlaceRepository.findAll();
    }

    public FamousPlace getPlaceById(Long id) {
        return famousPlaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Place not found"));
    }
    
 // Optional: Add pagination
    
 // ✅ FIXED: Different method name for pagination
    public Page<FamousPlace> getPlacesByCityPaginated(String city, Pageable pageable) {
        return famousPlaceRepository.findByCity(city, pageable);
    }
    
    // ✅ ADD: Pagination for all places
    public Page<FamousPlace> getAllPlacesPaginated(Pageable pageable) {
        return famousPlaceRepository.findAll(pageable);
    }
}