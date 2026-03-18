package com.flowenect.hr.dto.authority;

import lombok.Data;

/**
 * 권한관리(사원 권한) 목록 행 DTO
 * - EMP + DEPT + POSITION + EMP_ROLE(집계)
 */
@Data
public class AuthorityEmpRowDTO {
    private String empNo;
    private String empNm;

    private String deptCd;
    private String deptNm;

    private String posCd;
    private String posNm;

    private String acntActYn;
    private String acntActNm;
    private String empStatCd;

    private String deptRoleCd;
    private String deptRoleNm;

    private String posRoleCd;
    private String posRoleNm;

    /** EMP_ROLE의 ROLE_CD를 ","로 집계한 값 (예: ROLE_HR,ROLE_LEADER) */
    private String roleCds;
}
