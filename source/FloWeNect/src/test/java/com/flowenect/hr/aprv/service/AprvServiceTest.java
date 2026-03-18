package com.flowenect.hr.aprv.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.aprv.consts.AprvConst;
import com.flowenect.hr.aprv.mapper.AprvMapper;
import com.flowenect.hr.dto.aprv.AprvCreateDTO;
import com.flowenect.hr.dto.aprv.AprvDocDTO;
import com.flowenect.hr.dto.aprv.AprvEmpOptionDTO;
import com.flowenect.hr.dto.aprv.AprvLeaveDTO;
import com.flowenect.hr.dto.aprv.AprvLineDTO;
import com.flowenect.hr.dto.aprv.AprvReadListCondDTO;

@SpringBootTest(properties = {
    "cloud.aws.active=false",
    "storage.type=local",
    // DynamicPropertySource 제거: 테스트에서만 고정 주입
    "jasypt.encryptor.password=java"
})
@ActiveProfiles("dev")
@Transactional
class AprvServiceTest {

    /**
     * SUBMIT 시 PDF 생성 호출이 있어도 테스트는 PDF 목적이 아니므로 Mock 처리.
     * - AprvPdfServiceImpl / S3 / 파일 I/O 관여 X
     */
    @MockBean
    private AprvPdfService aprvPdfService;

    @Autowired private AprvService aprvService;
    @Autowired private AprvMapper aprvMapper;
    @Autowired private JdbcTemplate jdbcTemplate;

    private String writerEmpNo;
    private String writerDeptCd;

    @BeforeEach
    void setUp() {
        // aprvPdfService 기본 동작: 호출되어도 안전하게 “아무 것도 안 함”으로 리턴
        given(aprvPdfService.generatePdfBytes(anyLong(), anyString())).willReturn(new byte[0]);
        given(aprvPdfService.generateAndSaveSystemPdfOnSubmit(anyLong(), anyString())).willAnswer(inv -> (long) inv.getArgument(0));
        given(aprvPdfService.loadLatestSystemPdfBytes(anyLong(), anyString())).willReturn(new byte[0]);
        given(aprvPdfService.generateAndSaveFinalPdf(anyLong(), anyString())).willAnswer(inv -> (long) inv.getArgument(0));
        given(aprvPdfService.loadLatestPdfBytes(anyLong(), anyString())).willReturn(new byte[0]);

        // 스키마 제약 회피: EMP를 테스트가 생성하지 말고 "이미 존재하는 정상 사원"을 사용
        this.writerEmpNo = selectOneString(
            "SELECT EMP_NO " +
            "FROM EMP " +
            "WHERE LENGTH(EMP_NO)=10 " +
            "  AND REGEXP_LIKE(EMP_NO, '^(19|20)\\d{2}(0[1-9]|1[0-2])\\d{4}$') " +
            "  AND NVL(ACNT_ACT_YN,'Y')='Y' " +
            "  AND ROWNUM=1"
        );

        if (this.writerEmpNo == null) {
            throw new IllegalStateException("테스트용 작성자 EMP_NO(10자리, YYYYMM####)를 EMP에서 찾지 못했습니다.");
        }

        this.writerDeptCd = selectOneString("SELECT DEPT_CD FROM EMP WHERE EMP_NO = ?", writerEmpNo);
    }

    @Test
    void TEMP_SAVE_시_상태코드_DRAFT_저장확인() {
        AprvCreateDTO dto = buildLeaveCreateDto(AprvConst.CREATE_TEMP_SAVE, null);

        long aprvNo = aprvService.create(dto, writerEmpNo);

        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        assertThat(doc).isNotNull();
        assertThat(doc.getStatCd()).isEqualTo(AprvConst.DOC_DRAFT);
        assertThat(doc.getSubmitDtm()).isNull();

        List<AprvLineDTO> lines = aprvMapper.selectAprvLineListByAprvNo(aprvNo);
        assertThat(lines).isNotNull();
        assertThat(lines).isEmpty(); // TEMP_SAVE는 라인 생성 안 함
    }

    @Test
    void SUBMIT_시_상태코드변경_및_결재라인생성_확인() {
        List<String> approvers = pickApproversMax3(writerEmpNo);

        AprvCreateDTO dto = buildLeaveCreateDto(AprvConst.CREATE_SUBMIT, approvers);

        long aprvNo = aprvService.create(dto, writerEmpNo);

        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        assertThat(doc).isNotNull();
        assertThat(doc.getStatCd()).isEqualTo(AprvConst.DOC_SUBMITTED);
        assertThat(doc.getSubmitDtm()).isNotNull();

        List<AprvLineDTO> lines = aprvMapper.selectAprvLineListByAprvNo(aprvNo);
        assertThat(lines).isNotNull();
        assertThat(lines.size()).isEqualTo(approvers.size());

        for (int i = 0; i < lines.size(); i++) {
            AprvLineDTO line = lines.get(i);
            assertThat(line.getStatCd()).isEqualTo(AprvConst.LINE_WAIT);
            assertThat(line.getAprvSeq()).isEqualTo(i + 1);
            assertThat(line.getEmpNo()).isEqualTo(approvers.get(i));
        }
    }

    @Test
    void remove_시_조건만족하면_취소처리_확인() {
        AprvCreateDTO dto = buildLeaveCreateDto(AprvConst.CREATE_TEMP_SAVE, null);

        long aprvNo = aprvService.create(dto, writerEmpNo);

        aprvService.remove(aprvNo, writerEmpNo);

        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        assertThat(doc).isNotNull();
        assertThat(doc.getStatCd()).isEqualTo(AprvConst.DOC_CANCELED);
    }

    @Test
    void readList_조회_정상동작_확인() {
        List<String> approvers = pickApproversMax3(writerEmpNo);
        AprvCreateDTO dto = buildLeaveCreateDto(AprvConst.CREATE_SUBMIT, approvers);
        long aprvNo = aprvService.create(dto, writerEmpNo);

        AprvReadListCondDTO cond = new AprvReadListCondDTO();
        cond.setPage(1);
        cond.setSize(10);

        Map<String, Object> result = aprvService.readList(cond, writerEmpNo);

        assertThat(result).isNotNull();
        assertThat(result.get("docs")).isNotNull();
        assertThat(result.get("forms")).isNotNull();
        assertThat(result.get("page")).isNotNull();

        @SuppressWarnings("unchecked")
        List<?> docs = (List<?>) result.get("docs");
        assertThat(docs.size()).isGreaterThanOrEqualTo(1);

        int exists = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM APRV_DOC WHERE APRV_NO = ? AND EMP_NO = ?",
            Integer.class, aprvNo, writerEmpNo
        );
        assertThat(exists).isEqualTo(1);
    }

    // ---------------- helpers ----------------

    private AprvCreateDTO buildLeaveCreateDto(String actionType, List<String> approverEmpNosOrNull) {
        String leaveTypeCd = pickExistingOrFallback("APRV_LEAVE", "LEAVE_TYPE_CD", "ANNUAL");

        AprvLeaveDTO leave = AprvLeaveDTO.builder()
            .leaveTypeCd(leaveTypeCd)
            .startDtm(LocalDate.now().plusDays(1))
            .endDtm(LocalDate.now().plusDays(2))
            .reason("IT-통합테스트 사유")
            .build();

        AprvCreateDTO dto = new AprvCreateDTO();
        dto.setActionType(actionType);
        dto.setFormCd("LEAVE");
        dto.setAprvTtl("IT-통합테스트 제목");
        dto.setAprvCn("IT-통합테스트 내용");
        dto.setLeave(leave);

        if (approverEmpNosOrNull != null) {
            dto.setApproverEmpNoList(approverEmpNosOrNull);
        }
        return dto;
    }

    private List<String> pickApproversMax3(String writerEmpNo) {
        List<AprvEmpOptionDTO> deptHeads = safeList(aprvMapper.selectDeptHeadEmpOptionList());
        List<String> approvers = new ArrayList<>();

        for (AprvEmpOptionDTO opt : deptHeads) {
            if (opt == null || opt.getEmpNo() == null) continue;
            if (!approvers.contains(opt.getEmpNo())) {
                approvers.add(opt.getEmpNo());
            }
            if (approvers.size() >= 2) break;
        }

        if (approvers.isEmpty()) {
            List<AprvEmpOptionDTO> any = safeList(aprvMapper.selectAprvEmpOptionList());
            for (AprvEmpOptionDTO opt : any) {
                if (opt == null || opt.getEmpNo() == null) continue;
                if (!approvers.contains(opt.getEmpNo())) {
                    approvers.add(opt.getEmpNo());
                }
                if (approvers.size() >= 2) break;
            }
        }

        if (approvers.isEmpty()) {
            approvers.add(writerEmpNo);
        }

        if (approvers.size() > 3) {
            return approvers.subList(0, 3);
        }
        return approvers;
    }

    private <T> List<T> safeList(List<T> v) {
        return (v == null) ? List.of() : v;
    }

    private String pickExistingOrFallback(String table, String col, String fallback) {
        String v = selectOneString(
            "SELECT " + col + " FROM " + table + " WHERE " + col + " IS NOT NULL AND ROWNUM=1"
        );
        return (v == null || v.isBlank()) ? fallback : v;
    }

    private String selectOneString(String sql, Object... args) {
        List<String> list = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString(1), args);
        return list.isEmpty() ? null : list.get(0);
    }
}
