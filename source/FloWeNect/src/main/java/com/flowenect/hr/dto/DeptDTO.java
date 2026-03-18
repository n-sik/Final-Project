package com.flowenect.hr.dto;

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
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class DeptDTO {

	private String deptCd;			// PK 부서코드
	private String upDeptCd;		// FK 상위부서코드
	private String deptTypeCd;		// FK 부서종류코드
	private String deptHeadEmpNo;	// FK 사원번호 (부서장 / null 허용)
	private String deptNm;			// 부서명
	private String deptLoc;			// 부서위치
	private String deptTel;			// 부서대표전화번호
	private String delYn;			// 삭제여부 (기본값 'N')

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDtm;	// 등록일시 (SYSDATE)
	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime modDtm;	// 수정일시
}
