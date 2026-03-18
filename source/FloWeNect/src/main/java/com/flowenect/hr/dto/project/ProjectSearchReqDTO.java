package com.flowenect.hr.dto.project;

import lombok.Data;

/**
 * [프로젝트 부여/관리] 프로젝트 목록 조회 검색 조건
 * - useYn: Y / N / ALL(null 포함)
 */
@Data
public class ProjectSearchReqDTO {

    private String deptCd;            // 부서 코드(선택)
    private String projectStatCd;     // 상태 코드(선택)
    private String useYn;             // 사용 여부(Y/N/ALL) (선택)
    private String keyword;           // 프로젝트명/설명 키워드(선택)
}
