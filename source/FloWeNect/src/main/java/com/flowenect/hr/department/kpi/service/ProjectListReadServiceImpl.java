package com.flowenect.hr.department.kpi.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.department.kpi.mapper.ProjectListReadMapper;
import com.flowenect.hr.dto.project.ProjectDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProjectListReadServiceImpl implements ProjectListReadService {

	private final ProjectListReadMapper projectListReadMapper;

	@Override
	public List<ProjectDTO> getProjectListForView(String deptCd) {


        List<ProjectDTO> projectList =
                projectListReadMapper.selectProjectForView(deptCd);

        return projectList;
	}


}