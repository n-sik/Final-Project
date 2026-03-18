package com.flowenect.hr.department.schedule.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.ScheduleDTO;

@Mapper
public interface ScheduleMapper {

	List<ScheduleDTO> selectScheduleList();
}
