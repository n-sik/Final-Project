package com.flowenect.hr.department.kpi.service;

import java.util.List;

import com.flowenect.hr.dto.project.ProjectDTO;

public interface ProjectListReadService {

	List<ProjectDTO> getProjectListForView(String deptCd);


}
