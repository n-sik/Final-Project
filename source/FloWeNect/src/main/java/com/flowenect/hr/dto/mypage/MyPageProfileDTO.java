package com.flowenect.hr.dto.mypage;

import com.flowenect.hr.dto.FileDTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 마이페이지(내 정보) 조회용 DTO
 * - 사원명/부서/직위는 조회만
 * - 이메일/휴대폰/주소는 수정 가능 항목으로 함께 내려줌
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPageProfileDTO {
    private String empNo;
    private String empNm;
    private String deptCd;
    private String deptNm;
    private String posCd;
    private String posNm;

    private String empEmail;
    private String hpNo;
    private String zipCd;
    private String addr1;
    private String addr2;
    
    private FileDTO<String> profileImgDto;
}
