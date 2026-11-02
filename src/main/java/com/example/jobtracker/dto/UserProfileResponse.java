package com.example.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String email;
    private String authProvider;

    public UserProfileResponse(Long id, String email) {
        this(id, email, "PASSWORD");
    }
}

