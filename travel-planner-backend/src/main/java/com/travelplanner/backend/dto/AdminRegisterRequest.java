package com.travelplanner.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AdminRegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Admin secret code is required")
    private String adminSecretCode;

    // Constructors, getters, setters
    public AdminRegisterRequest() {}
    
    public AdminRegisterRequest(String username, String email, String password, String adminSecretCode) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.adminSecretCode = adminSecretCode;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getAdminSecretCode() { return adminSecretCode; }
    public void setAdminSecretCode(String adminSecretCode) { this.adminSecretCode = adminSecretCode; }
}