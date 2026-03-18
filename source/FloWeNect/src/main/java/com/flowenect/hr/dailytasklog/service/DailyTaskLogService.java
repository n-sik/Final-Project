package com.flowenect.hr.dailytasklog.service;

import com.flowenect.hr.dailytasklog.mapper.DailyTaskLogMapper;
import com.flowenect.hr.dto.dailytasklog.DailyTaskLogDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DailyTaskLogService {

    private final DailyTaskLogMapper mapper;

    /** 담당업무 목록 (사이드바) */
    public List<DailyTaskLogDTO> getTaskList(String empNo) {
        return mapper.selectTaskList(empNo);
    }

    /** 이전 일지 목록 (기간 필터) */
    public List<DailyTaskLogDTO> getLogList(DailyTaskLogDTO dto) {
        return mapper.selectLogList(dto);
    }

    /** 일지 단건 조회 */
    public DailyTaskLogDTO getLog(Long taskLogNo) {
        return mapper.selectLogByNo(taskLogNo);
    }

    /**
     * 일지 제출
     * - 오늘 이미 제출된 일지 있으면 수정
     * - ASSIGN_TASK 진행률 + 상태 동시 업데이트
     */
    @Transactional
    public String submitLog(DailyTaskLogDTO dto) {
        int todayCount = mapper.selectTodayLogCount(dto);
        if (todayCount > 0) {
            mapper.updateLog(dto);
        } else {
            mapper.insertLog(dto);
        }
        mapper.updateTaskProgress(dto);
        return todayCount > 0 ? "updated" : "inserted";
    }

    /**
     * 임시저장 (진행률 업데이트 없음)
     */
    @Transactional
    public void saveDraft(DailyTaskLogDTO dto) {
        int todayCount = mapper.selectTodayLogCount(dto);
        if (todayCount > 0) {
            mapper.updateLog(dto);
        } else {
            mapper.insertLog(dto);
        }
    }

    /** 일지 삭제 (소프트) */
    @Transactional
    public void deleteLog(DailyTaskLogDTO dto) {
        mapper.deleteLog(dto);
    }
    
    @Transactional
    public void updateLog(DailyTaskLogDTO dto) {
        mapper.updateLog(dto);
        mapper.updateTaskProgress(dto);
    }
}