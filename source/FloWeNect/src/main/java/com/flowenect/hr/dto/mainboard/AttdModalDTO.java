package com.flowenect.hr.dto.mainboard;

import com.flowenect.hr.dto.attendance.AttendanceDTO;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AttdModalDTO {
    /** 이번 달 출퇴근 기록 목록 */
    private List<AttendanceDTO> records;
    /** 통계 요약 */
    private AttdStatsDTO stats;

    @Getter @Setter
    public static class AttdStatsDTO {
        private int workDays;     // 출근일
        private int lateDays;     // 지각
        private int absentDays;   // 결근
        private int autoOutDays;  // 자동퇴근
    }
}