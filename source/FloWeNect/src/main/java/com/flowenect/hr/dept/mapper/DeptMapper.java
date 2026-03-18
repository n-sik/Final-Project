package com.flowenect.hr.dept.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.dept.DeptCreateReqDTO;
import com.flowenect.hr.dto.dept.DeptManageDTO;
import com.flowenect.hr.dto.dept.DeptModifyReqDTO;
import com.flowenect.hr.dto.dept.DeptSearchReqDTO;
import com.flowenect.hr.dto.dept.DeptTypeDTO;

@Mapper
public interface DeptMapper {

    List<DeptManageDTO> selectDeptManageList(@Param("cond") DeptSearchReqDTO cond);

    DeptManageDTO selectDeptManage(@Param("deptCd") String deptCd);

    DeptDTO selectDeptBasic(@Param("deptCd") String deptCd);

    String selectUpDeptCd(@Param("deptCd") String deptCd);

    int countEmpByDeptCd(@Param("deptCd") String deptCd);

    int countChildDeptByDeptCd(@Param("deptCd") String deptCd);

    int insertDept(@Param("req") DeptCreateReqDTO req);

    int updateDept(@Param("req") DeptModifyReqDTO req);

    int updateDeptDelYn(@Param("deptCd") String deptCd, @Param("delYn") String delYn);

    List<DeptTypeDTO> selectDeptTypeList();
}
