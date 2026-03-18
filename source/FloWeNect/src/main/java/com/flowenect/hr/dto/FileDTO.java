package com.flowenect.hr.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class FileDTO<T> {
    private T refNo;              // POST_NO 또는 EMP_FILE_TYPE_CD (파일 NO 등이 들어감
    private String fileTypeCd;    // 구분 코드: 'FT01', 'PROFILE' 등)
    private FileMetaDTO fileMeta; // 공통 속성
}