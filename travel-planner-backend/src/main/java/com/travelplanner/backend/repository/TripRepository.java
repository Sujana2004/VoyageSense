package com.travelplanner.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.Entities.Trip;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUserId(Long userId);
    List<Trip> findByUserUsername(String username);
    
 //  Eagerly fetch recommendedPlaces
    @Query("SELECT DISTINCT t FROM Trip t " +
            "LEFT JOIN FETCH t.recommendedPlaces " +
            "WHERE t.user.username = :username " +
            "ORDER BY t.createdAt DESC")
     List<Trip> findByUserUsernameWithPlaces(@Param("username") String username);
    
 // For single trip
    @Query("SELECT t FROM Trip t " +
           "LEFT JOIN FETCH t.recommendedPlaces " +
           "WHERE t.id = :id")
    Trip findByIdWithPlaces(@Param("id") Long id);
}
