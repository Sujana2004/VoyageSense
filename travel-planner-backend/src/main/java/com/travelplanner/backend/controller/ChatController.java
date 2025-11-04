package com.travelplanner.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.travelplanner.backend.Entities.ChatHistory;
import com.travelplanner.backend.dto.ChatHistoryDTO;
import com.travelplanner.backend.dto.ChatRequest;
import com.travelplanner.backend.service.ChatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class ChatController {
    
    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @PostMapping
    public ResponseEntity<?> sendMessage(@Valid @RequestBody ChatRequest request,
                                        @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        try {
            ChatHistory chat = chatService.processMessage(request.getMessage(), user.getUsername(), request.getConversationId());
            ChatHistoryDTO responseDTO = new ChatHistoryDTO(chat);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatHistoryDTO>> getChatHistory(
            @RequestParam(required = false) String conversationId,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        List<ChatHistory> history = chatService.getUserChatHistory(user.getUsername(), conversationId);
        List<ChatHistoryDTO> responseDTOs = history.stream()
                .map(ChatHistoryDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responseDTOs);
    }

//    @PostMapping
//    public ResponseEntity<?> sendMessage(@Valid @RequestBody ChatRequest request,
//                                        @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
//        try {
//            ChatHistory response = chatService.processMessage(request.getMessage(), user.getUsername(), request.getConversationId());
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
//        }
//    }
//
//    @GetMapping("/history")
//    public ResponseEntity<List<ChatHistory>> getChatHistory(
//            @RequestParam(required = false) String conversationId,
//            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
//        List<ChatHistory> history = chatService.getUserChatHistory(user.getUsername(), conversationId);
//        return ResponseEntity.ok(history);
//    }
}