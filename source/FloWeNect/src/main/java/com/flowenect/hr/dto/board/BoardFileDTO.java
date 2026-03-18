package com.flowenect.hr.dto.board;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardFileDTO {
	private Long boardFileNo;
	private Long postNo;

	// 원본 파일명
	private String fileNm;
	// 저장 파일명(UUID 등)
	private String saveFileNm;
	// 파일 저장 경로(상대 경로: board/...) - 파일서버 경로
	private String filePath;

	private Long fileSize;
	private String fileExt;
	private String delYn;
	private LocalDateTime regDtm;
}
