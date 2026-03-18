package com.flowenect.hr.dto.behavior;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 대상자 선택 모달 응답 DTO
 * - 화면 표시는 empNm/deptNm/posNm + 완료여부(doneYn)
 * - 내부 처리를 위해 empNo는 유지
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpPickDTO {

    private String empNo;
    private String empNm;
    private String deptNm;
    private String posNm;

    /** Y=설문완료, N=설문필요 */
    private String doneYn;
}