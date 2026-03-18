package com.flowenect.hr.mainboard.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import com.flowenect.hr.dto.mainboard.MainBoardScheduleDTO;
import com.flowenect.hr.dto.mainboard.NoticeDTO;

@Mapper
public interface MainBoardMapper {

    AttendanceDTO       selectTodayAttendance(@Param("empNo") String empNo);
    DailyTaskLogDTO     selectYesterdayDailyTaskLog(@Param("empNo") String empNo);
    List<AssignTaskDTO> selectRecentAssignTaskList(@Param("empNo") String empNo);

    List<MainBoardScheduleDTO> selectWeekSchedules(String empNo);
    List<NoticeDTO>            selectRecentNotices();
    
    /** 이번 달 출퇴근 기록 전체 */
    List<AttendanceDTO> selectMonthAttendance(@Param("empNo") String empNo);

    /** 이번 달 근태 통계 (workDays / lateDays / absentDays / autoOutDays) */
    Map<String, Object> selectMonthAttdStats(@Param("empNo") String empNo);
}