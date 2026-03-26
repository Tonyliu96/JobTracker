package com.example.jobtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String email;
}

