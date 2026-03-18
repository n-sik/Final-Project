package com.flowenect.hr.dto.aprv;

import java.time.LocalDateTime;

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
@ToString
public class ApprFileDTO {

    private long apprFileNo;
    private long aprvNo;

    private String fileNm;        // 원본 파일명
    private String saveFileNm;    // 저장 파일명(서버 내부)
    private String filePath;      // 서버 저장 경로(내부 경로)
    private Long fileSize;
    private String fileExt;

    private LocalDateTime regDtm;

    private String delYn;         // 'Y'/'N'
    private LocalDateTime delDtm;
}
