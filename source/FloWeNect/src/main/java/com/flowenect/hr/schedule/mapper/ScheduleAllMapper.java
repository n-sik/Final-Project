package com.flowenect.hr.schedule.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.schedule.ScheduleAllDTO;

@Mapper
public interface ScheduleAllMapper {

    // 전체 일정 조회 (삭제된 것 제외)
    List<ScheduleAllDTO> selectAllSchedules();
}