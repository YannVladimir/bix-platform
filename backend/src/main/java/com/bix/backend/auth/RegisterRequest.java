package com.bix.backend.auth;

import lombok.Data;

@Data
public class RegisterRequest {
    private String companyName;
    private String companyEmail;
    private String userName;
    private String userEmail;
    private String password;
}
