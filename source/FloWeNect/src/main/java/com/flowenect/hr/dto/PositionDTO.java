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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class PositionDTO {

	private String posCd;			// PK
	private String posNm;			// 직위명
	private Integer posLvl;			// 직위 레벨
	private String useYn;			// 사용여부 (기본값 'Y')

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
	private LocalDateTime regDtm;	// 등록 일시 (SYSDATE)
}
