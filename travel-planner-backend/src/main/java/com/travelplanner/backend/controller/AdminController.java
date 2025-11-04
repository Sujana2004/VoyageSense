package com.travelplanner.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.travelplanner.backend.dto.ChatHistoryDTO;
import com.travelplanner.backend.dto.TripResponseDTO;
import com.travelplanner.backend.dto.UserProfileDTO;
import com.travelplanner.backend.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class AdminController {
    
    private final AdminService adminService;
    
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/trips")
    public ResponseEntity<List<TripResponseDTO>> getAllTrips() {
        return ResponseEntity.ok(adminService.getAllTrips());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/chats")
    public ResponseEntity<List<ChatHistoryDTO>> getAllChats() {
        return ResponseEntity.ok(adminService.getAllChats());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/users/{userId}/trips")
    public ResponseEntity<List<TripResponseDTO>> getUserTrips(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserTrips(userId));
    }
    
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/users/{userId}/chats")
    public ResponseEntity<List<ChatHistoryDTO>> getUserChats(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserChats(userId));
    }
    
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok().body(Map.of(
                "message", "User deleted successfully",
                "deletedUserId", userId
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * Delete a single chat message
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/chats/{chatId}")
    public ResponseEntity<Map<String, Object>> deleteChat(@PathVariable Long chatId) {
        try {
            adminService.deleteChat(chatId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Chat message deleted successfully",
                "deletedChatId", chatId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    //Delete Trip
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/trips/{tripId}")
    public ResponseEntity<Map<String, Object>> deleteTrip(@PathVariable Long tripId) {
        try {
            adminService.deleteTrip(tripId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Trip deleted successfully",
                "deletedTripId", tripId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * Delete entire conversation
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Map<String, Object>> deleteConversation(@PathVariable String conversationId) {
        try {
            // Get stats before deletion for response
            Map<String, Object> stats = adminService.getConversationStats(conversationId);
            
            adminService.deleteConversation(conversationId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Conversation deleted successfully",
                "deletedConversationId", conversationId,
                "stats", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    
    
    /**
     * Get conversation details (for confirmation before deletion)
     */
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/conversations/{conversationId}/details")
    public ResponseEntity<?> getConversationDetails(@PathVariable String conversationId) {
        try {
            Map<String, Object> stats = adminService.getConversationStats(conversationId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}