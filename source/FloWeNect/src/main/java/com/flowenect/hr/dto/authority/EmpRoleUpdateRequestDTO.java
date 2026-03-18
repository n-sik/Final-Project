package com.flowenect.hr.dto.authority;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class EmpRoleUpdateRequestDTO {
    private String empNo;
    private List<String> roleCds = new ArrayList<>();
}
