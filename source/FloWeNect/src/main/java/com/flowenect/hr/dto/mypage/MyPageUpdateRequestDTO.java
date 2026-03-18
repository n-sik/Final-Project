package com.flowenect.hr.dto.mypage;

import org.springframework.web.multipart.MultipartFile;

import com.flowenect.hr.commons.validation.ByteSize;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 마이페이지(내 정보) 수정 요청 DTO
 * - empNo는 서버에서 세션/인증정보로 결정(클라에서 받지 않음)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPageUpdateRequestDTO {

    // 비밀번호 변경(선택)
    @Pattern(regexp = "^\\S{0,255}$", message = "비밀번호는 공백 없이 최대 255자까지 가능합니다.")
    @ByteSize(max = 255, message = "비밀번호는 최대 255바이트여야 합니다.")
    private String newPwd;

    private String newPwdConfirm;
    
    private MultipartFile profileImg;

    // 연락처/주소
    @Email(message = "이메일 형식이 올바르지 않습니다.")
    @ByteSize(max = 100, message = "이메일은 최대 100바이트여야 합니다.")
    private String empEmail;

    @Pattern(regexp = "^[0-9-]{0,20}$", message = "휴대전화번호는 숫자와 하이픈(-)만 입력 가능합니다.")
    @ByteSize(max = 20, message = "휴대전화번호는 최대 20바이트여야 합니다.")
    private String hpNo;

    @Pattern(regexp = "^[0-9-]{0,10}$", message = "우편번호는 숫자와 하이픈(-)만 입력 가능합니다.")
    @ByteSize(max = 10, message = "우편번호는 최대 10바이트여야 합니다.")
    private String zipCd;

    @Pattern(regexp = "^[\\s\\S]{0,200}$", message = "주소는 200자 이내여야 합니다.")
    @ByteSize(max = 200, message = "주소는 최대 200바이트여야 합니다.")
    private String addr1;

    @Pattern(regexp = "^[\\s\\S]{0,200}$", message = "상세주소는 200자 이내여야 합니다.")
    @ByteSize(max = 200, message = "상세주소는 최대 200바이트여야 합니다.")
    private String addr2;
}
