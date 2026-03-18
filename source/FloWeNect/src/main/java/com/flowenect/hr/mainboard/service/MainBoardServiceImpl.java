package com.flowenect.hr.mainboard.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.attendance.mapper.AttendanceMapper;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.mainboard.MainBoardDTO;
import com.flowenect.hr.mainboard.mapper.MainBoardMapper;

@Service
public class MainBoardServiceImpl implements MainBoardService {

    private final MainBoardMapper  mainBoardMapper;
    private final AttendanceMapper attendanceMapper;

    public MainBoardServiceImpl(MainBoardMapper mainBoardMapper,
                                AttendanceMapper attendanceMapper) {
        this.mainBoardMapper  = mainBoardMapper;
        this.attendanceMapper = attendanceMapper;
    }

    @Override
    public MainBoardDTO readMainBoard(String empNo) {

        MainBoardDTO dto = new MainBoardDTO();

        dto.setTodayAttendance(mainBoardMapper.selectTodayAttendance(empNo));
        dto.setYesterdayDaily(mainBoardMapper.selectYesterdayDailyTaskLog(empNo));

        var newTasks = mainBoardMapper.selectRecentAssignTaskList(empNo);
        dto.setNewTasks(newTasks);
        dto.setNewTaskCount(newTasks == null ? 0 : newTasks.size());

        dto.setWeekSchedules(mainBoardMapper.selectWeekSchedules(empNo));
        dto.setNotices(mainBoardMapper.selectRecentNotices());

        return dto;
    }

    @Transactional
    @Override
    public void createAttendanceIn(String empNo) {
        AttendanceDTO today = mainBoardMapper.selectTodayAttendance(empNo);
        if (today != null && today.getInDtm() != null) return;
        attendanceMapper.insertAttendanceIn(empNo);
    }

    @Transactional
    @Override
    public void modifyAttendanceOut(String empNo) {
        attendanceMapper.updateAttendanceOut(empNo);
    }
    
    @Override
    public List<AttendanceDTO> readMonthAttendance(String empNo) {
        return mainBoardMapper.selectMonthAttendance(empNo);
    }

    @Override
    public Map<String, Object> readMonthAttdStats(String empNo) {
        return mainBoardMapper.selectMonthAttdStats(empNo);
    }
}