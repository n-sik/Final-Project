package com.flowenect.hr.security.auth;

import java.util.List;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.emp.mapper.EmpMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final EmpMapper empMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        // username == EMP_NO
        EmpDTO realUser = empMapper.selectEmpForAuth(username);
        if (realUser == null) {
            throw new UsernameNotFoundException("%s 사용자 없음".formatted(username));
        }

        // 정책: 퇴사만 차단 + 계정 비활성(N) 차단
        if (!"Y".equals(realUser.getAcntActYn()) || "퇴사".equals(realUser.getEmpStatCd())) {
            throw new UsernameNotFoundException("%s 로그인 불가 계정".formatted(username));
        }

        List<String> roleCds = empMapper.selectEmpRoleCds(realUser.getEmpNo());
        if (roleCds == null || roleCds.isEmpty()) {
            roleCds = List.of("ROLE_USER"); // 임시 기본 권한
        }

        return new EmpDTOWrapper(realUser, roleCds);
    }
}
