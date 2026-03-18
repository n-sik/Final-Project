package com.flowenect.hr.dto.board;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.flowenect.hr.dto.PositionDTO;

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
public class BoardTypeDTO {
	
	private Integer boardTypeNo;		// PK 게시판 종류 번호
	private String boardTypeNm;			// 게시판 종류명
	private Integer sortOrd;			// 정렬순서
	private String useYn;				// 사용여부 (기본값 'Y')
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDtm;		// 등록 일시 (SYSDATE)
}
