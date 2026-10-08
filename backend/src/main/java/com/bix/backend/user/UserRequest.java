package com.bix.backend.user;

import lombok.Data;

@Data
public class UserRequest {
    private String name;
    private String email;
    private String password;
    private User.Role role;
    private String status;
    private Long companyId;
}
