package com.flowenect.hr.mainboard.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.assigntask.AssignTaskDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.mainboard.MainBoardDTO;
import com.flowenect.hr.mainboard.mapper.MainBoardMapper;

import software.amazon.awssdk.services.s3.S3Client;

@SpringBootTest(
    properties = {
        "cloud.aws.active=false",
        "storage.type=local",
        // 테스트에서만 암복호화 키를 고정 주입 (DynamicPropertySource 제거)
        "jasypt.encryptor.password=java"
    }
)
@ActiveProfiles("dev")
@TestPropertySource(properties = {
    // 필요하면 여기서 AI 설정을 완전히 꺼버리기
    // (프로젝트에서 ai 모듈이 프로퍼티 바인딩 때문에 터질 때만 사용)
    "spring.ai.enabled=false"
})
@Transactional
class MainBoardServiceTest {

    // S3Client를 요구하는 빈이 있어도 테스트에서는 Mock으로 대체
    @MockBean
    private S3Client s3Client;

    @Autowired
    private MainBoardService mainBoardService;

    @Autowired
    private MainBoardMapper mainBoardMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String empNo;
    private String deptCd;
    private Long kpiNo;
    private String taskStatCd;
    private String logDivCd;

    @BeforeEach
    void setUp() {
        this.empNo = selectOneString(
            "SELECT EMP_NO " +
            "FROM EMP " +
            "WHERE LENGTH(EMP_NO) = 10 " +
            "  AND REGEXP_LIKE(EMP_NO, '^(19|20)\\d{2}(0[1-9]|1[0-2])\\d{4}$') " +
            "  AND NVL(ACNT_ACT_YN,'Y') = 'Y' " +
            "  AND NVL(EMP_STAT_CD,'WORK') <> 'RETIRE' " +
            "  AND ROWNUM = 1"
        );
        if (this.empNo == null) {
            throw new IllegalStateException("테스트용 활성 사원을 EMP에서 찾지 못했습니다.");
        }

        this.deptCd = selectOneString("SELECT DEPT_CD FROM EMP WHERE EMP_NO = ?", empNo);

        this.kpiNo = selectOneLong("SELECT KPI_NO FROM KPI WHERE ROWNUM = 1");
        if (this.kpiNo == null) {
            throw new IllegalStateException("KPI 테이블에 데이터가 없어 ASSIGN_TASK를 만들 수 없습니다.");
        }

        this.taskStatCd = selectOneString(
            "SELECT TASK_STAT_CD FROM ASSIGN_TASK " +
            "WHERE TASK_STAT_CD IS NOT NULL AND NVL(DEL_YN,'N')='N' AND ROWNUM=1"
        );
        if (this.taskStatCd == null) this.taskStatCd = "TODO";

        this.logDivCd = selectOneString(
            "SELECT LOG_DIV_CD FROM DAILY_TASK_LOG " +
            "WHERE LOG_DIV_CD IS NOT NULL AND NVL(DEL_YN,'N')='N' AND ROWNUM=1"
        );
        if (this.logDivCd == null) this.logDivCd = "DAILY";

        jdbcTemplate.update(
            "DELETE FROM ATTENDANCE WHERE EMP_NO=? AND WORK_DT=TRUNC(SYSDATE)",
            empNo
        );
    }

    @Test
    void createAttendanceIn_실행후_DB에_IN_DTM_저장확인() {
        mainBoardService.createAttendanceIn(empNo);

        AttendanceDTO today = mainBoardMapper.selectTodayAttendance(empNo);
        assertThat(today).isNotNull();
        assertThat(today.getInDtm()).isNotNull();
        assertThat(today.getEmpNo()).isEqualTo(empNo);
    }

    @Test
    void modifyAttendanceOut_실행후_DB에_OUT_DTM_저장확인() {
        mainBoardService.createAttendanceIn(empNo);
        mainBoardService.modifyAttendanceOut(empNo);

        AttendanceDTO today = mainBoardMapper.selectTodayAttendance(empNo);
        assertThat(today).isNotNull();
        assertThat(today.getInDtm()).isNotNull();
        assertThat(today.getOutDtm()).isNotNull();
        assertThat(today.getOutAutoYn()).isEqualTo("N");
    }

    @Test
    void readMainBoard_오늘근태_전일업무_최근7일신규업무_정상조회() {
        mainBoardService.createAttendanceIn(empNo);

        Long yTaskNo = selectOneLong("SELECT SEQ_TASK_NO.NEXTVAL FROM DUAL");
        jdbcTemplate.update(
            "INSERT INTO ASSIGN_TASK (TASK_NO, EMP_NO, KPI_NO, DEPT_CD, TASK_TITLE, TASK_CN, TASK_STAT_CD, PROGRESS_RATE, REG_DTM, MOD_DTM, DEL_YN, TASK_START_DTM, TASK_END_DTM, DEL_DTM) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, 0, SYSDATE, SYSDATE, 'N', (TRUNC(SYSDATE)-1) + (9/24), (TRUNC(SYSDATE)-1) + (18/24), NULL)",
            yTaskNo, empNo, kpiNo, deptCd, "전일업무용 TASK(IT)", "전일업무 TASK 내용", taskStatCd
        );

        Long nextTaskLogNo = selectOneLong("SELECT NVL(MAX(TASK_LOG_NO),0)+1 FROM DAILY_TASK_LOG");
        jdbcTemplate.update(
            "INSERT INTO DAILY_TASK_LOG (TASK_LOG_NO, TASK_NO, EMP_NO, LOG_DIV_CD, LOG_TITLE, LOG_CN, WORK_DTM, REG_DTM, MOD_DTM, DEL_YN, DEL_DTM) " +
            "VALUES (?, ?, ?, ?, ?, ?, (TRUNC(SYSDATE)-1) + (10/24), (TRUNC(SYSDATE)-1) + (11/24), NULL, 'N', NULL)",
            nextTaskLogNo, yTaskNo, empNo, logDivCd, "전일업무(IT)", "전일업무 내용"
        );

        Long taskNo = selectOneLong("SELECT SEQ_TASK_NO.NEXTVAL FROM DUAL");
        jdbcTemplate.update(
            "INSERT INTO ASSIGN_TASK (TASK_NO, EMP_NO, KPI_NO, DEPT_CD, TASK_TITLE, TASK_CN, TASK_STAT_CD, PROGRESS_RATE, REG_DTM, MOD_DTM, DEL_YN, TASK_START_DTM, TASK_END_DTM, DEL_DTM) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, 0, SYSDATE, SYSDATE, 'N', SYSDATE, SYSDATE + 1, NULL)",
            taskNo, empNo, kpiNo, deptCd, "신규업무(IT)", "신규업무 내용", taskStatCd
        );

        MainBoardDTO dto = mainBoardService.readMainBoard(empNo);

        assertThat(dto).isNotNull();
        assertThat(dto.getTodayAttendance()).isNotNull();
        assertThat(dto.getYesterdayDaily()).isNotNull();

        assertThat(dto.getNewTasks()).isNotNull();
        assertThat(dto.getNewTasks().size()).isGreaterThanOrEqualTo(1);

        AssignTaskDTO first = dto.getNewTasks().get(0);
        assertThat(first.getEmpNo()).isEqualTo(empNo);
        assertThat(first.getTaskNo()).isNotNull();
        assertThat(first.getTaskTitle()).isNotBlank();
        assertThat(first.getRegDtm()).isNotNull();
    }

    // helpers
    private String selectOneString(String sql, Object... args) {
        List<String> list = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(1), args);
        return list.isEmpty() ? null : list.get(0);
    }

    private Long selectOneLong(String sql, Object... args) {
        List<Long> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Object v = rs.getObject(1);
            if (v == null) return null;
            if (v instanceof Number n) return n.longValue();
            if (v instanceof String s) return Long.parseLong(s);
            return null;
        }, args);
        return list.isEmpty() ? null : list.get(0);
    }
}
