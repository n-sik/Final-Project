package com.flowenect.hr.aprv.service;

import java.util.List;
import java.util.Map;

import com.flowenect.hr.dto.aprv.AprvCreateDTO;
import com.flowenect.hr.dto.aprv.AprvEmpOptionDTO;
import com.flowenect.hr.dto.aprv.AprvFormTypeDTO;
import com.flowenect.hr.dto.aprv.AprvAssetHistDTO;
import com.flowenect.hr.dto.aprv.AprvCodeDTO;
import com.flowenect.hr.dto.aprv.AprvEmpSnapDTO;
import com.flowenect.hr.dto.aprv.AprvProcessDTO;
import com.flowenect.hr.dto.aprv.AprvReadDTO;
import com.flowenect.hr.dto.aprv.AprvReadListCondDTO;

public interface AprvService {

    List<AprvFormTypeDTO> readFormTypes();

    List<AprvEmpOptionDTO> readEmpOptions();
    
    List<AprvEmpOptionDTO> readDeptHeadOptions();

    // 작성 화면용: 로그인 사원 스냅샷(부서/직위/이름)
    AprvEmpSnapDTO readEmpSnap(String empNo);

    // 작성 화면용: 코드 목록(예: LEAVE_TP, LOA_TP)
    List<AprvCodeDTO> readStatCodes(String statDiv);

    Map<String, Object> readList(AprvReadListCondDTO cond, String empNo);

    void modify(AprvProcessDTO dto, String empNo);

    void remove(long aprvNo, String empNo);

    long create(AprvCreateDTO dto, String empNo);

    AprvReadDTO read(long aprvNo, String empNo);
    
    List<AprvCodeDTO> readDeptCodes();
    
    List<AprvCodeDTO> readPosCodes();
    
    String readDeptHeadEmpNo(String deptCd);
    
    List<AprvAssetHistDTO> readAssetHistList(long aprvNo, String empNo);

}
