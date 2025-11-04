package com.travelplanner.backend.Entities;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_history")
public class ChatHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"trips", "chatHistories", "password"})
    private User user;

    @Column(columnDefinition = "TEXT")
    private String userMessage;

    @Column(columnDefinition = "TEXT")
    private String aiResponse;

    private String conversationId;
    
    private LocalDateTime timestamp;

    // Constructors
    public ChatHistory() {}
    
    public ChatHistory(User user, String userMessage, String aiResponse, String conversationId) {
        this.user = user;
        this.userMessage = userMessage;
        this.aiResponse = aiResponse;
        this.conversationId = conversationId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters
    public Long getId() { 
        return id; 
    }
    
    public User getUser() { 
        return user; 
    }
    
    public String getUserMessage() { 
        return userMessage; 
    }
    
    public String getAiResponse() { 
        return aiResponse; 
    }
    
    public String getConversationId() { 
        return conversationId; 
    }
    
    public LocalDateTime getTimestamp() { 
        return timestamp; 
    }

    // Setters
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public void setUser(User user) { 
        this.user = user; 
    }
    
    public void setUserMessage(String userMessage) { 
        this.userMessage = userMessage; 
    }
    
    public void setAiResponse(String aiResponse) { 
        this.aiResponse = aiResponse; 
    }
    
    public void setConversationId(String conversationId) { 
        this.conversationId = conversationId; 
    }
    
    public void setTimestamp(LocalDateTime timestamp) { 
        this.timestamp = timestamp; 
    }

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}