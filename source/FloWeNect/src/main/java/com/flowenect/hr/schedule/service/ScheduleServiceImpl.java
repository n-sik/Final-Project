package com.flowenect.hr.schedule.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.dto.schedule.ScheduleAllDTO;
import com.flowenect.hr.schedule.mapper.ScheduleAllMapper;

import lombok.RequiredArgsConstructor;

@Service("integrationScheduleServiceImpl")
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleAllMapper ScheduleAllMapper;

    @Override
    public List<ScheduleAllDTO> getAllSchedules() {
        return ScheduleAllMapper.selectAllSchedules();
    }
}