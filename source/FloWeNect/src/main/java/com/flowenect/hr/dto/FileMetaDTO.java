package com.flowenect.hr.dto;

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
public class FileMetaDTO {

    private Long fileNo;          // FILE_NO (PK)
    private String fileNm;        // FILE_NM (원본 파일명)
    private String saveFileNm;    // SAVE_FILE_NM (저장된 고유 파일명)
    private String filePath;      // FILE_PATH (내 저장 경로)
    private Long fileSize;        // FILE_SIZE (파일 크기)
    private String fileExt;       // FILE_EXT (파일 확장자)
    private LocalDateTime regDtm; // REG_DTM (등록 일시)
    private String delYn;         // DEL_YN (삭제 여부, 기본값 'N')
    private LocalDateTime delDtm; // DEL_DTM (삭제 일시)
    private String empNm;

}