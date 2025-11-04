package com.travelplanner.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.travelplanner.backend.Entities.ChatHistory;
import com.travelplanner.backend.dto.ChatHistoryDTO;
import com.travelplanner.backend.dto.TripResponseDTO;
import com.travelplanner.backend.dto.UserProfileDTO;
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

    public List<UserProfileDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserProfileDTO::new)  
                .collect(Collectors.toList());
    }

    public List<TripResponseDTO> getAllTrips() {
        return tripRepository.findAll().stream()
                .map(TripResponseDTO::new)  // ← Use your existing DTO
                .collect(Collectors.toList());
    }

    public List<ChatHistoryDTO> getAllChats() {
        return chatHistoryRepository.findAll().stream()
                .map(ChatHistoryDTO::new)  // ← Use your existing DTO
                .collect(Collectors.toList());
    }

    public List<TripResponseDTO> getUserTrips(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        return tripRepository.findByUserId(userId).stream()
                .map(TripResponseDTO::new)
                .collect(Collectors.toList());
    }

    public List<ChatHistoryDTO> getUserChats(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        return chatHistoryRepository.findByUserId(userId).stream()
                .map(ChatHistoryDTO::new)
                .collect(Collectors.toList());
    }
    
    public ResponseEntity<?> deleteUser(Long userId) {
        // Check if user exists
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with id: " + userId);
        }
        
        userRepository.deleteById(userId);
        
        return ResponseEntity.ok().body(Map.of(
            "message", "User deleted successfully",
            "deletedUserId", userId
        ));
    }
    
    /**
     * Delete a single chat message by ID
     */
    @Transactional
    public void deleteChat(Long chatId) {
        if (!chatHistoryRepository.existsById(chatId)) {
            throw new RuntimeException("Chat message not found with id: " + chatId);
        }
        chatHistoryRepository.deleteById(chatId);
    }
    
    @Transactional
    public void deleteTrip(Long tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new RuntimeException("Trip not found with id: " + tripId);
        }
        tripRepository.deleteById(tripId);
    }
    
    /**
     * Delete all messages in a conversation
     */
    @Transactional
    public void deleteConversation(String conversationId) {
        List<ChatHistory> conversationChats = chatHistoryRepository.findByConversationId(conversationId);
        if (conversationChats.isEmpty()) {
            throw new RuntimeException("No chats found for conversation: " + conversationId);
        }
        chatHistoryRepository.deleteAll(conversationChats);
    }
    
    /**
     * Get conversation statistics
     */
    public Map<String, Object> getConversationStats(String conversationId) {
        List<ChatHistory> conversationChats = chatHistoryRepository.findByConversationId(conversationId);
        
        if (conversationChats.isEmpty()) {
            throw new RuntimeException("Conversation not found: " + conversationId);
        }

        String username = conversationChats.get(0).getUser().getUsername();
        long messageCount = conversationChats.size();
        LocalDateTime firstMessage = conversationChats.stream()
                .map(ChatHistory::getTimestamp)
                .min(LocalDateTime::compareTo)
                .orElse(null);
        LocalDateTime lastMessage = conversationChats.stream()
                .map(ChatHistory::getTimestamp)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        return Map.of(
            "conversationId", conversationId,
            "username", username,
            "messageCount", messageCount,
            "firstMessage", firstMessage,
            "lastMessage", lastMessage,
            "willBeDeleted", true
        );
    }
}