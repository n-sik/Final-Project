package com.flowenect.hr.security.jwt;

import java.io.Serializable;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RestAuthDTO implements Serializable {
    @NotBlank
    private String username;	// empNo

    @NotBlank
    private String password;	// pwd
}
