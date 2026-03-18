package com.flowenect.hr.department.kpi.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.kpi.TaskDTO;

@Mapper
public interface TaskMapper {

    int insertTask(TaskDTO taskDto);

    List<TaskDTO> selectTaskListByKpi(Long kpiNo);

    TaskDTO selectTaskDetail(Long taskNo);

    int updateTask(TaskDTO taskDto);

    int deleteTask(Long taskNo);

    List<TaskDTO> selectDeptMembers(String deptCd);
}