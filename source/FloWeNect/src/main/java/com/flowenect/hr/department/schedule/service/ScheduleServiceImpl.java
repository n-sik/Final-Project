package com.flowenect.hr.department.schedule.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.department.schedule.mapper.ScheduleMapper;
import com.flowenect.hr.dto.ScheduleDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

	private final ScheduleMapper scheduleMapper;

	@Override
	public List<ScheduleDTO> getScheduleList() {

		return scheduleMapper.selectScheduleList();
	}
}
