package com.flowenect.hr.dto.aprv;

import java.time.LocalDateTime;

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
@EqualsAndHashCode(of = "lineNo")
@ToString(exclude = {"rjctRsn"})
public class AprvLineDTO {

    private long lineNo;              // PK (SEQ_LINE_NO)
    private long aprvNo;              // FK

    private String empNo;             // EMP_NO (결재자)
    private Integer aprvSeq;          // 순번

    private LocalDateTime aprvDtm;
    private String rjctRsn;           // RJCT_RSN (길어질 수 있어 exclude)

    private String aprverDeptCd;
    private String aprverPosCd;
    private String aprverEmpNm;

    private String aprverDeptNm;
    private String aprverPosNm;

    private String statDiv;
    private String statCd;            // WAIT/APPROVED/REJECTED
}
