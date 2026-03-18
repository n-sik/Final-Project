package com.flowenect.hr.dto.login;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ResetPasswordRequestDTO {
	
    private String empNo;  // EMP_NO
    private String name;   // EMP_NM
    private String email;  // EMP_EMAIL

}
