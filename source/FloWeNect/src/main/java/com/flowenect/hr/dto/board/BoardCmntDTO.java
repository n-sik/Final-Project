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
public class BoardCmntDTO {

	private Integer cmntNo;			// PK 댓글 번호
	private Integer postNo;			// FK 게시글 번호
	private Integer parentCmntNo;	// FK 상위 댓글 번호 (null 이면 댓글 , null 이 아니면 대댓글)
	private Integer commentLvl;		// 댓글 레벨 (1: 부모댓글, 2: 자식댓글/대댓글)
	private String commentCn;		// 내용
	private String writerEmpNo;		// 작성자 사원 번호
	private String delYn;			// 삭제여부 (기본값 'N')
	
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDtm;	// 등록 일시 (SYSDATE)
}
