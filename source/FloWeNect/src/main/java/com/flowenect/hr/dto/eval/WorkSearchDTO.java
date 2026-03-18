package com.flowenect.hr.dto.eval;

import lombok.Data;

@Data
public class WorkSearchDTO {
	private Long taskNo;
    private String deptCd;
    private String empNo;      
    private String projectNo;  
    private String startDate;
    private String endDate;
    private String searchKeyword;
    private String searchType;
}
