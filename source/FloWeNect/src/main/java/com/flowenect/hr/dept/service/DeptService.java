package com.flowenect.hr.dept.service;

import java.util.List;

import com.flowenect.hr.dto.dept.DeptCreateReqDTO;
import com.flowenect.hr.dto.dept.DeptManageDTO;
import com.flowenect.hr.dto.dept.DeptModifyReqDTO;
import com.flowenect.hr.dto.dept.DeptSearchReqDTO;
import com.flowenect.hr.dto.dept.DeptTypeDTO;

public interface DeptService {

    List<DeptManageDTO> readList(DeptSearchReqDTO cond);

    DeptManageDTO read(String deptCd);

    void create(DeptCreateReqDTO req);

    void modify(DeptModifyReqDTO req);

    /**
     * 사용중지(DEL_YN='Y')
     * - 사원 0명 조건 필수
     */
    void softDelete(String deptCd);

    /**
     * 복구(DEL_YN='N')
     */
    void restore(String deptCd);

    List<DeptTypeDTO> readDeptTypeList();
}