package com.flowenect.hr.department.schedule.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.flowenect.hr.department.schedule.service.ScheduleService;
import com.flowenect.hr.dto.ScheduleDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/work/schedule") // 경로를 /work/schedule 까지만 잡습니다.
@RequiredArgsConstructor
@Slf4j
public class ScheduleController {

    private final ScheduleService scheduleService;

    // 1. 페이지 접속 (URL: localhost/work/schedule/readList)
    @GetMapping("/readList")
    public String scheduleForm() {
        log.info("===> 일정 페이지(scheduleForm) 접속 요청");
        return "department/schedule/scheduleForm";
    }

    // 2. 데이터 API (URL: localhost/work/schedule/api/list)
    @GetMapping("/api/list")
    @ResponseBody
    public List<ScheduleDTO> getScheduleData() {
        log.info("===> 일정 데이터 API 호출됨");

        List<ScheduleDTO> list = scheduleService.getScheduleList();

        if (list != null) {
            log.info("===> DB 조회 성공! 데이터 개수: {}개", list.size());
            // 데이터 내용이 궁금하다면 첫 번째 항목만 살짝 찍어보기
            if (!list.isEmpty()) {
                log.info("===> 첫 번째 데이터 예시: {}", list.get(0).getTaskTitle());
            }
        } else {
            log.error("===> DB 결과가 null입니다. 서비스나 매퍼를 확인하세요.");
        }

        return list;
    }
}