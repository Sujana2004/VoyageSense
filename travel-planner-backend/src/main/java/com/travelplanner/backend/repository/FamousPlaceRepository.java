package com.travelplanner.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.travelplanner.backend.Entities.FamousPlace;

@Repository
public interface FamousPlaceRepository extends JpaRepository<FamousPlace, Long> {
    List<FamousPlace> findByCity(String city);
    List<FamousPlace> findByCountry(String country);
    List<FamousPlace> findByCategory(String category);
    
    @Query("SELECT fp FROM FamousPlace fp WHERE fp.city = :city AND fp.rating >= :minRating")
    List<FamousPlace> findTopRatedInCity(@Param("city") String city, @Param("minRating") double minRating);
    
    List<FamousPlace> findByCityAndCategory(String city, String category);
    Page<FamousPlace> findByCity(String city, Pageable pageable);
    
}