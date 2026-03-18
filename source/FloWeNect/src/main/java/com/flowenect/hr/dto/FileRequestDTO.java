package com.flowenect.hr.dto;

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
public class FileRequestDTO {
    private String refType;   // 참조 타입 (예: "BOARD", "PROFILE", "APPROVE")
    private Long empNo;      // 참조 대상의 ID (예: 게시글 번호, 사원 번호)
    private String empNoStr;  // 등록자 사번 (현재 로그인한 사용자 정보)
}