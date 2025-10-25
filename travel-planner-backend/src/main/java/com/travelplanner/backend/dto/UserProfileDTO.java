package com.travelplanner.backend.dto;

import java.time.LocalDateTime;

import com.travelplanner.backend.Entities.User;

public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private int tripCount;
    private int chatCount;

    public UserProfileDTO() {}

    // Constructor from User entity
    public UserProfileDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole().name();
        this.createdAt = user.getCreatedAt();
        this.tripCount = user.getTrips() != null ? user.getTrips().size() : 0;
        this.chatCount = user.getChatHistories() != null ? user.getChatHistories().size() : 0;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public int getTripCount() { return tripCount; }
    public void setTripCount(int tripCount) { this.tripCount = tripCount; }
    public int getChatCount() { return chatCount; }
    public void setChatCount(int chatCount) { this.chatCount = chatCount; }
}