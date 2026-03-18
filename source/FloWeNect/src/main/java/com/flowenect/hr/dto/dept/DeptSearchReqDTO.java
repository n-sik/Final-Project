package com.flowenect.hr.dto.dept;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class DeptSearchReqDTO {

    /**
     * delYn: N / Y / ALL
     * - 기본값은 서비스에서 N 처리
     */
    private String delYn;

    /**
     * searchField: ALL / deptCd / deptNm / deptTypeNm / upDeptNm / deptHeadEmpNm / deptTel / deptLoc
     */
    private String searchField;

    /**
     * keyword: 검색어
     */
    private String keyword;
}
