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
@ToString(exclude = {"doc"})
public class AprvReadDTO {

    private AprvDocDTO doc;
    private List<AprvLineDTO> lineList;

    // 결재 라인별 적용된 서명/직인 스냅샷(선택)
    private List<AprvAssetHistDTO> assetHists;

    // 화면 버튼 조건
    private boolean canApprove;   // 내 차례 결재 가능 여부
    private boolean canCancel;    // 작성자 취소 가능 여부

    // 양식별 상세(선택)
    private AprvLeaveDTO leave;
    private AprvLoaDTO loa;
    private AprvPromotionDTO promotion;
    private AprvAppointmentDTO appointment;
    private AprvHeadcountDTO headcount;
    private AprvRetireDTO retire;

    // 참조, 파일 조회
    private List<AprvRefDTO> refs;
    private List<ApprFileDTO> files;
}
