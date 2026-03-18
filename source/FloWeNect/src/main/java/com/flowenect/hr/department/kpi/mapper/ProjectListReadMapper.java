package com.flowenect.hr.department.kpi.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.project.ProjectDTO;

@Mapper
public interface ProjectListReadMapper {

	List<ProjectDTO> selectProjectForView(@Param("deptCd") String deptCd);
}