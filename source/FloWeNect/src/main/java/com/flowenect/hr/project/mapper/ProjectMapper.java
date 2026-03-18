package com.flowenect.hr.project.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.project.ProjectCreateReqDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.dto.project.ProjectModifyReqDTO;
import com.flowenect.hr.dto.project.ProjectSearchReqDTO;

@Mapper
public interface ProjectMapper {

    List<ProjectDTO> selectProjectManageList(@Param("cond") ProjectSearchReqDTO cond);

    ProjectDTO selectProjectManage(@Param("projectNo") Long projectNo);

    int insertProject(@Param("regEmpNo") String regEmpNo, @Param("req") ProjectCreateReqDTO req);

    int updateProject(@Param("req") ProjectModifyReqDTO req);

    int updateProjectUseYn(@Param("projectNo") Long projectNo, @Param("useYn") String useYn);
}
