package com.flowenect.hr.schedule.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowenect.hr.dto.schedule.ScheduleAllDTO;
import com.flowenect.hr.schedule.service.ScheduleService;

import lombok.RequiredArgsConstructor;

@RestController("integrationScheduleController")
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 전체 일정 조회 API
    @GetMapping("/list")
    public ResponseEntity<List<ScheduleAllDTO>> getScheduleList() {
        return ResponseEntity.ok(scheduleService.getAllSchedules());
    }
}