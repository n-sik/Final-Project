package com.flowenect.hr.department.kpi.service;

import java.util.List;

import com.flowenect.hr.dto.kpi.TaskDTO;

public interface TaskService {
    String registerTask(TaskDTO taskDto);
    List<TaskDTO> getTaskListByKpi(Long kpiNo);
    TaskDTO getTaskDetail(Long taskNo);
    String modifyTask(TaskDTO taskDto);
    String removeTask(Long taskNo);
    List<TaskDTO> getDeptMembers(String deptCd);  // ✅ 이 줄 확인
}