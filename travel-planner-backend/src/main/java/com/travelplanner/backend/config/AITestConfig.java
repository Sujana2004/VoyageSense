package com.travelplanner.backend.config;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AITestConfig {
    
    @Bean
    public CommandLineRunner testAI(ChatModel chatModel) {
        return args -> {
            try {
                System.out.println("🧪 Testing AI Connection...");
                // Simple test to verify AI is working
                String response = chatModel.call("Say 'AI is connected successfully' in one sentence.");
                System.out.println("✅ AI Test Response: " + response);
            } catch (Exception e) {
                System.err.println("❌ AI Connection Failed: " + e.getMessage());
            }
        };
    }
}