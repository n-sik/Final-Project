package com.flowenect.hr.dto.project;

import java.util.Date;

import lombok.Data;

/**
 * [프로젝트 부여/관리] 프로젝트 등록 요청 DTO
 * - MAIN_IMG_PATH는 현재 DTO까지만 구현(서비스/매퍼/컨트롤러 미사용)
 */
@Data
public class ProjectCreateReqDTO {

    private String deptCd;            // 부서 코드 (필수)
    private String projectNm;         // 프로젝트명 (필수)
    private String projectDesc;       // 프로젝트 설명
    private String projectStatCd;     // 상태 코드 (ING / END / HOLD) (필수)
    private Date startDtm;            // 시작일 (필수)
    private Date endDtm;              // 종료일 (필수)

    // 화면에서는 기본값 Y로 내려주고, 서버에서도 null이면 Y로 보정
    private String useYn;             // 사용 여부 (Y/N)
}
