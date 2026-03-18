package com.flowenect.hr.dto.sidebar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpMenuSetDTO {
	
    private Long menuNo;
    private String empNo;
    private Integer sortOrd;
}
