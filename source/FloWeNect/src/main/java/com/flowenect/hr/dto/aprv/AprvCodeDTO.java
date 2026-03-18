package com.flowenect.hr.dto.aprv;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * APRV_STAT_CD(code table) 조회용 간단 DTO
 * - JSP(aprvForm.jsp)에서 ${c.code}, ${c.name}로 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class AprvCodeDTO {
    private String code;
    private String name;
}
