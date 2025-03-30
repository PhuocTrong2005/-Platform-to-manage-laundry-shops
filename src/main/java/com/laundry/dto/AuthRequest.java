package com.laundry.dto;

public class AuthRequest {
    private String email;
    private String passwordHash; // ✅ Đảm bảo dùng passwordHash

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
}
