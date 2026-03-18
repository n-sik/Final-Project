package com.flowenect.hr.dto.mainboard;

import lombok.Data;

@Data
public class MainBoardScheduleDTO {

    private Long   schdNo;       // SCHD_NO
    private String empNo;        // EMP_NO
    private String empNm;
    private String schdDivCd;    // SCHD_DIV_CD  (교육 / VACATION / 채용)
    private String schdTitle;    // SCHD_TITLE
    private String schdStDtm;    // SCHD_ST_DTM  (String으로 받아서 JSP에서 substring)
    private String schdEdDtm;    // SCHD_ED_DTM
    private String allDayYn;     // ALL_DAY_YN
    private String color;        // COLOR
}