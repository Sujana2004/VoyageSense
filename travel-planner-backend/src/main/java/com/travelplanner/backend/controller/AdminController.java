package com.travelplanner.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.travelplanner.backend.Entities.ChatHistory;
import com.travelplanner.backend.Entities.Trip;
import com.travelplanner.backend.Entities.User;
import com.travelplanner.backend.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/trips")
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(adminService.getAllTrips());
    }

    @GetMapping("/chats")
    public ResponseEntity<List<ChatHistory>> getAllChats() {
        return ResponseEntity.ok(adminService.getAllChats());
    }

    @GetMapping("/users/{userId}/trips")
    public ResponseEntity<List<Trip>> getUserTrips(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserTrips(userId));
    }

    @GetMapping("/users/{userId}/chats")
    public ResponseEntity<List<ChatHistory>> getUserChats(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserChats(userId));
    }
}