package com.flowenect.hr.dto.aprv;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AprvReadListCondDTO {

    // JSP hidden: box=mine (기본 mine)
    private String box = "mine"; // mine | pending | processed | ref

    private String fromDt;       // YYYY-MM-DD
    private String toDt;         // YYYY-MM-DD

    private String docStatCd;    // DRAFT, IN_PROGRESS, APPROVED, REJECTED, CANCELED
    private String formCd;       // APRV_FORM_TYPE.FORM_CD

    private String aprvNo;       // 사용자 입력(숫자 PK) 예: 12345
    private Long aprvNoNum;      // 서비스에서 숫자만 파싱해서 세팅

    private String aprvTtlPrefix; // 제목 prefix 검색

    private int page = 1;
    private int size = 10;
}