package com.travelplanner.backend.dto;

import com.travelplanner.backend.Entities.ChatHistory;
import java.time.LocalDateTime;

public class ChatHistoryDTO {
    private Long id;
    private String userMessage;
    private String aiResponse;
    private String conversationId;
    private LocalDateTime timestamp;
    private String username;
    
    public ChatHistoryDTO() {}
    
    public ChatHistoryDTO(ChatHistory chat) {
        this.id = chat.getId();
        this.userMessage = chat.getUserMessage();
        this.aiResponse = chat.getAiResponse();
        this.conversationId = chat.getConversationId();
        this.timestamp = chat.getTimestamp();
        this.username = chat.getUser().getUsername();
    }
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }
    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
}