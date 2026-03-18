package com.flowenect.hr.dto.mainboard;

import java.util.List;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;

import lombok.Data;

@Data
public class MainBoardDTO {

    private AttendanceDTO              todayAttendance;
    private DailyTaskLogDTO            yesterdayDaily;
    private List<AssignTaskDTO>        newTasks;
    private int                        newTaskCount;

    private List<MainBoardScheduleDTO> weekSchedules;
    private List<NoticeDTO>            notices;
}