package com.flowenect.hr.dto.board;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

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
public class BoardDTO {

	private Integer postNo;			// PK 게시글 번호
	private Integer boardTypeNo;	// FK 게시판 종류 번호
	private String boardTypeNm;	// 게시판 종류명(JOIN)
	private String regEmpNo;		// FK 작성자 사원 번호
	private String regEmpNm;		// 작성자 이름(JOIN)
	private String title;			// 제목
	private String cn;				// 내용
	private Integer viewCnt;		// 조회수

	/**
	 * 첨부파일 목록(상세 조회 응답에서만 주로 사용)
	 */
	private java.util.List<BoardFileDTO> files;
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDtm;	// 등록 일시 (SYSDATE)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modDtm;	// 수정 일시
	
	private String delYn;			// 삭제여부 (기본값 'N')
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime delDtm;	// 삭제 일시
	
	private String periodYn;		// 기간관리여부 (기본값 'N') -> 'Y'일 경우 일정 연동 (교육,채용 해당)
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime startDtm;	// 시작 일시
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime endDtm;	// 종료 일시
}
