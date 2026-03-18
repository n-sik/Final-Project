package com.flowenect.hr.dto.aprv;

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
@ToString(exclude = {"rjctRsn"})
public class AprvProcessDTO {

    private long aprvNo;
    private String action;   // "APPROVE" or "REJECT"
    private String rjctRsn;  // reject일 때만 사용(길 수 있으니 exclude)

    // 결재자 자산 선택(SIGN/SEAL) - approve일 때만 의미 있음
    private String assetType;
}