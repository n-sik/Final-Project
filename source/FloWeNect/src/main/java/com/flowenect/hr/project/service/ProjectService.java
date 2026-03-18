package com.flowenect.hr.project.service;

import java.util.List;

import com.flowenect.hr.dto.project.ProjectCreateReqDTO;
import com.flowenect.hr.dto.project.ProjectDTO;
import com.flowenect.hr.dto.project.ProjectModifyReqDTO;
import com.flowenect.hr.dto.project.ProjectSearchReqDTO;

public interface ProjectService {

    List<ProjectDTO> readList(ProjectSearchReqDTO cond);

    ProjectDTO read(Long projectNo);

    void create(ProjectCreateReqDTO req, String regEmpNo);

    void modify(ProjectModifyReqDTO req);

    void softDelete(Long projectNo);

    void restore(Long projectNo);
}
