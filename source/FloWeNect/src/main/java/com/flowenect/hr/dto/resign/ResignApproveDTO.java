package com.flowenect.hr.dto.resign;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResignApproveDTO {
    private String       aprvNo;    // 단건: APRV_DOC.APRV_NO
    private List<String> aprvNos;   // 다건: APRV_DOC.APRV_NO 목록
    private String       statCd;    // "COMPLETED" | "REJECTED"
}