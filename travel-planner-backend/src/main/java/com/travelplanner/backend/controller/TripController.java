
package com.travelplanner.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.travelplanner.backend.Entities.Trip;
import com.travelplanner.backend.dto.TripRequest;
import com.travelplanner.backend.dto.TripResponseDTO;
import com.travelplanner.backend.service.TripService;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class TripController {
    
    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }
    
    @PostMapping
    public ResponseEntity<?> createTrip(@RequestBody TripRequest request, 
                                       @AuthenticationPrincipal User user) {
        try {
            Trip trip = tripService.createTrip(request, user.getUsername());
            TripResponseDTO responseDTO = new TripResponseDTO(trip);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TripResponseDTO>> getUserTrips(@AuthenticationPrincipal User user) {
//        List<Trip> trips = tripService.getUserTrips(user.getUsername());
//        List<TripResponseDTO> responseDTOs = trips.stream()
//                .map(TripResponseDTO::new)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(responseDTOs);
    	List<TripResponseDTO> trips = tripService.getUserTrips(user.getUsername());
        return ResponseEntity.ok(trips);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripResponseDTO> getTrip(@PathVariable Long id, 
                                       @AuthenticationPrincipal User user) {
        TripResponseDTO trip = tripService.getUserTrip(id, user.getUsername());
        return ResponseEntity.ok(trip);
    }
//    @PostMapping
//    public ResponseEntity<?> createTrip(@RequestBody TripRequest request, 
//                                       @AuthenticationPrincipal User user) {
//        try {
//            Trip trip = tripService.createTrip(request, user.getUsername());
//            return ResponseEntity.ok(trip);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }

//    @GetMapping
//    public ResponseEntity<List<Trip>> getUserTrips(@AuthenticationPrincipal User user) {
//        List<Trip> trips = tripService.getUserTrips(user.getUsername());
//        return ResponseEntity.ok(trips);
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Trip> getTrip(@PathVariable Long id, 
//                                       @AuthenticationPrincipal User user) {
//        Trip trip = tripService.getUserTrip(id, user.getUsername());
//        return ResponseEntity.ok(trip);
//    }
}
