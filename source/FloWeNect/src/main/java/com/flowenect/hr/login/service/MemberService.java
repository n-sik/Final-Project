package com.flowenect.hr.login.service;

import java.security.SecureRandom;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.login.mapper.MemberMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberMapper memberMapper;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
    private static final int TEMP_PW_LENGTH = 8;

    /**
     * 사번 찾기
     * EMP 테이블에서 EMP_NM + EMP_EMAIL 일치하는 사원의 EMP_NO 반환
     */
    public String findEmpNo(String name, String email) {
        return memberMapper.findEmpNoByNameAndEmail(name, email);
    }

    /**
     * 비밀번호 초기화
     * 1. 사번 + 이름 + 이메일 검증
     * 2. 임시 비밀번호 생성
     * 3. BCrypt 암호화 후 DB 업데이트
     * 4. 이메일 발송
     */
    @Transactional
    public void resetPassword(String empNo, String name, String email) {
        // 1. 사원 정보 검증
        int count = memberMapper.countByEmpNoAndNameAndEmail(empNo, name, email);
        if (count == 0) {
            throw new IllegalArgumentException("입력하신 정보와 일치하는 사원을 찾을 수 없습니다.");
        }

        // 2. 계정 활성 여부 확인
        String acntYn = memberMapper.findAcntActYn(empNo);
        if (!"Y".equals(acntYn)) {
            throw new IllegalArgumentException("비활성화된 계정입니다. 관리자에게 문의해 주세요.");
        }

        // 3. 임시 비밀번호 생성
        String tempPw = generateTempPassword();

        // 4. BCrypt 암호화 후 DB 저장
        String encodedPw = passwordEncoder.encode(tempPw);
        memberMapper.updatePassword(empNo, encodedPw);

        // 5. 이메일 발송
        emailService.sendTempPasswordEmail(email, name, tempPw);

        log.info("임시 비밀번호 발급 완료 - empNo: {}", empNo);
    }

    /** 랜덤 임시 비밀번호 생성 */
    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TEMP_PW_LENGTH);
        for (int i = 0; i < TEMP_PW_LENGTH; i++) {
            sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}