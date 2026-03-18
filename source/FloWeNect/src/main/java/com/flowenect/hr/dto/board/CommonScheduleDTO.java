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
public class CommonScheduleDTO {

	private Integer schdNo;		// PK 일정 번호
	private String empNo;		// FK 등록자 사원 번호
	private Integer refPostNo;	// FK 참조 게시글 번호
	private String schdDivCd;	// 일정 구분 코드
	private String schdTitle;	// 일정 제목
	private String schdCn;		// 일정 내용
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime schdStDtm;	// 일정 시작 일시
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime schdEdDtm;	// 일정 종료 일시
	
	private String allDayYn;	// 종일여부 ('Y/N') -> 연차는 보통 'Y'
	private String delYn;		// 삭제여부 (기본값 'N')
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDtm;
	
	private String color;
	private Integer schdPrio;
}
