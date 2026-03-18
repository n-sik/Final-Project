package com.flowenect.hr.dto.aprv;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "aprvNo")
@ToString(exclude = {"aprvCn"})
public class AprvDocDTO {

    private long aprvNo;              // APRV_NO NUMBER(8) PK
    private String formCd;
    private String empNo;             // EMP_NO (기안자)

    private String aprvTtl;
    private String aprvCn;            // APRV_CN CLOB (대용량 -> exclude)

    private LocalDateTime submitDtm;
    private LocalDateTime finalDtm;

    private String docWrtrDeptCd;
    private String docWrtrPosCd;
    private String docWrtrEmpNm;

    private String statDiv;
    private String statCd;            // STAT_CD (DRAFT/IN_PROGRESS/APPROVED/REJECTED/CANCELED)
    
    // 추가
    
    private String docPdfPath;  // PDF 파일 저장 경로 (S3 URL 등)
    private String hrApplyYn;   // 인사팀 ERP 반영 여부 (Y/N)
    private String docStatCmt;  // 반려 사유 등 코멘트
    
    // 화면에 보여줄 때 필요한 조인 데이터
    private String empNm;       // 기안자 이름
    private String deptNm;      // 기안자 부서명
    private String posNm;       // 기안자 직위명
    private String statNm;      // 결재 상태 한글명 (예: 진행중)
    
    // 관계 매핑
    private List<AprvLineDTO> aprvLines; // 결재선 리스트
    private List<ApprFileDTO> fileList;  // 첨부파일 리스트    
    
}
