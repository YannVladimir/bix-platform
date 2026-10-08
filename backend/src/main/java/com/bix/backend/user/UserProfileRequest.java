package com.bix.backend.user;

import lombok.Data;

@Data
public class UserProfileRequest {
    private String name;
    private String email;
    private String language;
}
