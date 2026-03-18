package com.flowenect.hr.department.kpi.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.department.kpi.mapper.TaskMapper;
import com.flowenect.hr.dto.kpi.TaskDTO;
import com.flowenect.hr.dto.notification.NotificationDTO;
import com.flowenect.hr.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskMapper taskMapper;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public String registerTask(TaskDTO taskDto) {
        int result = taskMapper.insertTask(taskDto);

        // ✅ 개인업무 부여 알림 (DB 누적 + (연결시) 실시간 토스트)
        if (result > 0 && taskDto != null && taskDto.getEmpNo() != null) {
            String title = (taskDto.getTaskTitle() != null && !taskDto.getTaskTitle().isBlank())
                    ? taskDto.getTaskTitle()
                    : "(제목 없음)";

            NotificationDTO noti = NotificationDTO.builder()
                    .recvEmpNo(taskDto.getEmpNo())
                    .notiTypeCd("TASK")
                    .notiCn("개인업무가 부여되었습니다: " + title)
                    .srcTypeCd("TASK")
                    .srcNo(taskDto.getTaskNo() != null ? String.valueOf(taskDto.getTaskNo()) : null)
                    .moveUrl("/main")
                    .readYn("N")
                    .build();

            notificationService.createAndPushToUser(noti);
        }

        return result > 0 ? "success" : "fail";
    }

    @Override
    public List<TaskDTO> getTaskListByKpi(Long kpiNo) {
        return taskMapper.selectTaskListByKpi(kpiNo);
    }

    @Override
    public TaskDTO getTaskDetail(Long taskNo) {
        return taskMapper.selectTaskDetail(taskNo);
    }

    @Override
    @Transactional
    public String modifyTask(TaskDTO taskDto) {
        int result = taskMapper.updateTask(taskDto);
        return result > 0 ? "success" : "fail";
    }

    @Override
    @Transactional
    public String removeTask(Long taskNo) {
        int result = taskMapper.deleteTask(taskNo);
        return result > 0 ? "success" : "fail";
    }

    @Override
    public List<TaskDTO> getDeptMembers(String deptCd) {
        log.info("🔍 Service: 부서원 조회 시작 - 부서코드: {}", deptCd);
        List<TaskDTO> members = taskMapper.selectDeptMembers(deptCd);
        log.info("🔍 Service: 조회 결과 {}명", members != null ? members.size() : 0);

        // ✅ 디버깅: 조회된 데이터 전체 출력
        if (members != null && !members.isEmpty()) {
            for (TaskDTO m : members) {
                log.info("   - {} ({})", m.getEmpNm(), m.getEmpNo());
            }
        }

        return members;
    }
}