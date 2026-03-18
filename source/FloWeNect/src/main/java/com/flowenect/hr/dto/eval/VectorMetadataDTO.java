package com.flowenect.hr.dto.eval;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorMetadataDTO {
    private String empNo;      // 사번
    private String projectNm;  // 프로젝트명
    private Long taskNo;       // 업무번호
    private String regDtm;     // 등록일시
}
