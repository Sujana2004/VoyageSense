package com.travelplanner.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.travelplanner.backend.Entities.ChatHistory;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserId(Long userId);
    List<ChatHistory> findByUserUsername(String username);
    List<ChatHistory> findByConversationId(String conversationId);
    List<ChatHistory> findByUserUsernameAndConversationId(String username, String conversationId);
}