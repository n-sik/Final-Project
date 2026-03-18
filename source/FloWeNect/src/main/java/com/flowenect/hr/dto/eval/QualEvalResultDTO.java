package com.flowenect.hr.dto.eval;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class QualEvalResultDTO {

	private Long resultNo;

	@NotBlank(message = "피평가자 사원번호는 필수입니다.")
	private String targetEmpNo;
	
	private String evaluatorId;

	private String targetName;

	@NotNull(message = "평가 점수를 선택해주세요.")
    @Min(value = 1, message = "최소 점수는 1점입니다.")
    @Max(value = 5, message = "최대 점수는 5점입니다.")
    private Integer evalScore;

	@NotBlank(message = "평가 코드는 필수입니다.")
    private String evalCd;

	@NotBlank(message = "평가 항목명이 누락되었습니다.")
	private String evalComment;

	private LocalDate evalDtm;

	@Pattern(regexp = "^\\d{4}$")
    private String evalYear;

	@NotBlank(message = "분기 정보가 필요합니다.")
    @Pattern(regexp = "^[1-2]$", message = "분기는 1 또는 2만 입력 가능합니다.")
    private String evalQuarter;

	@Valid
	private List<QualEvalResultDTO> resultList;
}
