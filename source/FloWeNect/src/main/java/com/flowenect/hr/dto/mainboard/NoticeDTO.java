package com.flowenect.hr.dto.mainboard;

import lombok.Data;

@Data
public class NoticeDTO {
    private Long   noticeNo;
    private String noticeTitle;
    private String noticeType;   // 긴급 / 인사 / 공지 (없으면 공지 기본)
    private String regDtm;
}
