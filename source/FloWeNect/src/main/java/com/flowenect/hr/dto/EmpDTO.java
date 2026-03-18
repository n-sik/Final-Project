package com.flowenect.hr.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.flowenect.hr.commons.validation.ByteSize;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
@ToString(exclude = "pwd")
public class EmpDTO implements Serializable {

    /**
     * EMP_NO VARCHAR2(10) NOT NULL
     * 형식: YYYYMM + 4자리 (총 10자리 숫자), 1월부터 12월까지 : 01 ~ 12
     */
    @NotBlank
    @Pattern(
    		  regexp = "^(19|20)\\d{2}(0[1-9]|1[0-2])\\d{4}$",
    		  message = "EMP_NO는 YYYYMM0001 형식(월은 01~12)이어야 합니다."
    		)
    @ByteSize(max = 10, message = "EMP_NO는 최대 10바이트여야 합니다.")
    private String empNo;

    /**
     * DEPT_CD VARCHAR2(20) NOT NULL
     * 코드형식(영문/숫자/언더스코어/하이픈) 1~20바이트
     */
    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9_-]{1,20}$", message = "DEPT_CD는 영문/숫자/_/- 조합 1~20자리여야 합니다.")
    @ByteSize(max = 20, message = "DEPT_CD는 최대 20바이트여야 합니다.")
    private String deptCd;

    /**
     * POS_CD VARCHAR2(10) NOT NULL
     */
    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9_-]{1,10}$", message = "POS_CD는 영문/숫자/_/- 조합 1~10자리여야 합니다.")
    @ByteSize(max = 10, message = "POS_CD는 최대 10바이트여야 합니다.")
    private String posCd;

    /**
     * EMP_NM VARCHAR2(50) NOT NULL
     * 한글/영문/공백 허용, 바이트 최대 50
     */
    @NotBlank
    @Pattern(regexp = "^[가-힣A-Za-z\\s]{1,50}$", message = "EMP_NM은 한글/영문/공백만 입력 가능합니다.")
    @ByteSize(max = 50, message = "EMP_NM은 최대 50바이트여야 합니다.")
    private String empNm;

    /**
     * PWD VARCHAR2(255) NOT NULL (기본값 '1234')
     * 공백 제외, 바이트 최대 255
     */
    @NotBlank
    @Pattern(regexp = "^\\S{1,255}$", message = "PWD는 공백 없이 1~255 길이여야 합니다.")
    @ByteSize(max = 255, message = "PWD는 최대 255바이트여야 합니다.")
    private String pwd;

    /**
     * HIRE_DT DATE NOT NULL
     */
    @NotNull
    private LocalDate hireDt;

    /**
     * EMP_EMAIL VARCHAR2(100) NULL
     */
    @Email
    @ByteSize(max = 100, message = "EMP_EMAIL은 최대 100바이트여야 합니다.")
    private String empEmail;

    /**
     * HP_NO VARCHAR2(20) NULL
     * 010-1234-5678 또는 숫자만 허용
     */
    @Pattern(regexp = "^[0-9-]{0,20}$", message = "HP_NO는 숫자와 하이픈(-)만 입력 가능합니다.")
    @ByteSize(max = 20, message = "HP_NO는 최대 20바이트여야 합니다.")
    private String hpNo;

    /**
     * RRNO VARCHAR2(255) NULL
     * 암호화/마스킹 저장을 고려해 넓게 허용(공백 포함도 필요하면 정규식 수정)
     */
    @ByteSize(max = 255, message = "RRNO는 최대 255바이트여야 합니다.")
    private String rrno;

    /**
     * ZIP_CD VARCHAR2(10) NULL
     * 한국 우편번호(5자리) 또는 숫자/하이픈 조합
     */
    @Pattern(regexp = "^[0-9-]{0,10}$", message = "ZIP_CD는 숫자와 하이픈(-)만 입력 가능합니다.")
    @ByteSize(max = 10, message = "ZIP_CD는 최대 10바이트여야 합니다.")
    private String zipCd;

    /**
     * ADDR1 VARCHAR2(200) NULL
     */
    @Pattern(regexp = "^[\\s\\S]{0,200}$", message = "ADDR1은 200자 이내여야 합니다.")
    @ByteSize(max = 200, message = "ADDR1은 최대 200바이트여야 합니다.")
    private String addr1;

    /**
     * ADDR2 VARCHAR2(200) NULL
     */
    @Pattern(regexp = "^[\\s\\S]{0,200}$", message = "ADDR2는 200자 이내여야 합니다.")
    @ByteSize(max = 200, message = "ADDR2는 최대 200바이트여야 합니다.")
    private String addr2;

    /**
     * EMP_STAT_CD VARCHAR2(10) NULL (기본값 'WORK')
     * '재직/휴직/퇴사' 중 하나 (NULL 허용)
     */
    @Pattern(regexp = "^(재직|휴직|퇴사)?$", message = "EMP_STAT_CD는 재직/휴직/퇴사 중 하나여야 합니다.")
    @ByteSize(max = 10, message = "EMP_STAT_CD는 최대 10바이트여야 합니다.")
    private String empStatCd;

    /**
     * ACNT_ACT_YN CHAR(1) NULL (기본값 'Y')
     */
    @Pattern(regexp = "^[YN]?$", message = "ACNT_ACT_YN은 Y 또는 N만 가능합니다.")
    @ByteSize(max = 1, message = "ACNT_ACT_YN은 1바이트여야 합니다.")
    private String acntActYn;

    /**
     * REG_DTM DATE NULL (DEFAULT SYSDATE)
     * MOD_DTM DATE NULL
     */
    private LocalDateTime regDtm;
    private LocalDateTime modDtm;
}
