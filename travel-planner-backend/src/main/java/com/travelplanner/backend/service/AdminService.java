package com.travelplanner.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.travelplanner.backend.Entities.ChatHistory;
import com.travelplanner.backend.Entities.Trip;
import com.travelplanner.backend.Entities.User;
import com.travelplanner.backend.repository.ChatHistoryRepository;
import com.travelplanner.backend.repository.TripRepository;
import com.travelplanner.backend.repository.UserRepository;

@Service
public class AdminService {
    
    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final ChatHistoryRepository chatHistoryRepository;
    
    public AdminService(UserRepository userRepository, TripRepository tripRepository,
            ChatHistoryRepository chatHistoryRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public List<ChatHistory> getAllChats() {
        return chatHistoryRepository.findAll();
    }

    public List<Trip> getUserTrips(Long userId) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        return tripRepository.findByUserId(userId);
    }

    public List<ChatHistory> getUserChats(Long userId) {
        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        return chatHistoryRepository.findByUserId(userId);
    }
}