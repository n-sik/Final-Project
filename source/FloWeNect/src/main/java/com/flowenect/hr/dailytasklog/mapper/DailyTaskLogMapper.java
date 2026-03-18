package com.flowenect.hr.dailytasklog.mapper;

import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface DailyTaskLogMapper {

    // 담당업무 목록 조회 (사이드바용, ASSIGN_TASK JOIN)
    List<DailyTaskLogDTO> selectTaskList(String empNo);

    // 이전 일지 목록 조회 (기간 필터)
    List<DailyTaskLogDTO> selectLogList(DailyTaskLogDTO dto);

    // 일지 단건 조회
    DailyTaskLogDTO selectLogByNo(Long taskLogNo);

    // 오늘 일지 존재 여부 (중복 제출 방지)
    int selectTodayLogCount(DailyTaskLogDTO dto);

    // 일지 등록
    int insertLog(DailyTaskLogDTO dto);

    // 일지 수정
    int updateLog(DailyTaskLogDTO dto);

    // 일지 삭제 (소프트)
    int deleteLog(DailyTaskLogDTO dto);

    // 담당업무 진행률 + 상태 업데이트
    int updateTaskProgress(DailyTaskLogDTO dto);
}