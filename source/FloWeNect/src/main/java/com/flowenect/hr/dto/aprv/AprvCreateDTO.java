package com.flowenect.hr.dto.aprv;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"aprvCn"})
public class AprvCreateDTO {

    private String formCd;
    private String aprvTtl;
    private String aprvCn;               // CLOB 가능 -> exclude

    /**
     * TEMP_SAVE | SUBMIT
     */
    private String actionType;


    private Long aprvNo; // DRAFT 덮어쓰기용

    // 참조자 사번 목록(다중)
    private List<String> refEmpNoList;


    // 수신자 사번 목록(다중)
    private List<String> rcvEmpNoList;
    // 결재자 사번 목록(순서대로)
    private List<String> approverEmpNoList;

    /**
     * 복사 재기안: 원문서 번호(선택)
     */
    private Long copyFromAprvNo;

    // ========== 양식별 상세(선택) ==========
    private AprvLeaveDTO leave;
    private AprvLoaDTO loa;
    private AprvPromotionDTO promotion;
    private AprvAppointmentDTO appointment;
    private AprvHeadcountDTO headcount;
    private AprvRetireDTO retire;
}
