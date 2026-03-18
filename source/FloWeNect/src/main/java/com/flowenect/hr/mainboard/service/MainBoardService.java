package com.flowenect.hr.mainboard.service;

import java.util.List;
import java.util.Map;

import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.mainboard.MainBoardDTO;

public interface MainBoardService {

    MainBoardDTO readMainBoard(String empNo);

    void createAttendanceIn(String empNo);   // 당일 1회만

    void modifyAttendanceOut(String empNo);  // 18시 고정 룰 포함
    List<AttendanceDTO> readMonthAttendance(String empNo);
    Map<String, Object> readMonthAttdStats(String empNo);
}
