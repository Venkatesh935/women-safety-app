package com.venkatesh.womensafety;

public class LoginResponse {
    private Long userId;
    private String name;
    private String email;
    private String phone;

    public LoginResponse(Long userId, String name, String email, String phone) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }
}