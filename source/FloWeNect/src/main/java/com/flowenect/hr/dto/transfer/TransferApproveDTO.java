package com.flowenect.hr.dto.transfer;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransferApproveDTO {
	
    private String       aprvNo;   // 단건용
    private List<String> aprvNos;  // 다건용
    private String       statCd;   // APPROVED / REJECTED
    
}