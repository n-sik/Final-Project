package com.flowenect.hr.dto.mypage;

import com.flowenect.hr.commons.validation.ByteSize;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 마이페이지 진입 보안 확인용 DTO
 * - 현재 비밀번호 확인(1회)
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyPageVerifyRequestDTO {

    @NotBlank(message = "현재 비밀번호를 입력해주세요.")
    @Pattern(regexp = "^\\S{1,255}$", message = "비밀번호는 공백 없이 최대 255자까지 가능합니다.")
    @ByteSize(max = 255, message = "비밀번호는 최대 255바이트여야 합니다.")
    private String currentPwd;
}
