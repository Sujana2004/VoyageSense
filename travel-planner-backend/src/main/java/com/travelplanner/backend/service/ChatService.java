package com.travelplanner.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.travelplanner.backend.Entities.ChatHistory;
import com.travelplanner.backend.Entities.User;
import com.travelplanner.backend.repository.ChatHistoryRepository;

@Service
public class ChatService {
    
    private final ChatHistoryRepository chatHistoryRepository;
    private final UserService userService;
    private final ChatModel chatModel;

    public ChatService(ChatHistoryRepository chatHistoryRepository, UserService userService, ChatModel chatModel) {
        this.chatHistoryRepository = chatHistoryRepository;
        this.userService = userService;
        this.chatModel = chatModel;
    }

    public ChatHistory processMessage(String message, String username, String conversationId) {
        User user = userService.findByUsername(username);
        
        if (conversationId == null || conversationId.isEmpty()) {
            conversationId = UUID.randomUUID().toString();
        }
        
        String aiResponse = getAIResponse(message, username, conversationId);
        
        ChatHistory chatHistory = new ChatHistory();
        chatHistory.setUser(user);
        chatHistory.setUserMessage(message);
        chatHistory.setAiResponse(aiResponse);
        chatHistory.setConversationId(conversationId);
        
        return chatHistoryRepository.save(chatHistory);
    }

    private String getAIResponse(String message, String username, String conversationId) {
        try {
            List<ChatHistory> conversationHistory = chatHistoryRepository
                    .findByUserUsernameAndConversationId(username, conversationId);
            
            // Build conversation context
            StringBuilder context = new StringBuilder();
            context.append("You are a travel planning assistant. Help users with travel-related questions.\n\n");
            
            for (ChatHistory chat : conversationHistory) {
                if (chat.getUserMessage() != null) {
                    context.append("User: ").append(chat.getUserMessage()).append("\n");
                }
                if (chat.getAiResponse() != null) {
                    context.append("Assistant: ").append(chat.getAiResponse()).append("\n");
                }
            }
            
            context.append("User: ").append(message);
            
            // Create messages for the prompt
            SystemMessage systemMessage = new SystemMessage("You are a helpful travel planning assistant. Provide concise and helpful responses about travel, trips, destinations, and planning.");
            UserMessage userMessage = new UserMessage(context.toString());
            
            // Create and execute prompt
            Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
            
            // CORRECTED: Use the new API for Spring AI 1.0.0
            ChatResponse response = chatModel.call(prompt);
            
            // Extract content from the response - CORRECTED METHOD
            return response.getResult().getOutput().getText();
                    
        } catch (Exception e) {
            e.printStackTrace();
            return "I apologize, but I'm having trouble responding right now. Please try again later.";
        }
    }

    public List<ChatHistory> getUserChatHistory(String username, String conversationId) {
        if (conversationId != null && !conversationId.isEmpty()) {
            return chatHistoryRepository.findByUserUsernameAndConversationId(username, conversationId);
        } else {
            return chatHistoryRepository.findByUserUsername(username);
        }
    }

    public List<ChatHistory> getAllChats() {
        return chatHistoryRepository.findAll();
    }
}