package com.flowenect.hr.security.auth;

import java.util.List;

import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;

import com.flowenect.hr.dto.EmpDTO;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString(callSuper = true)
public class EmpDTOWrapper extends User {

    private final EmpDTO realUser;

    public EmpDTOWrapper(EmpDTO realUser, List<String> roleCds) {
        super(
                realUser.getEmpNo(),    // username
                realUser.getPwd(),      // password(암호화된 값)

                // 퇴사 차단 정책 반영
                isEnabled(realUser),    // enabled
                true,                   // accountNonExpired
                true,                   // credentialsNonExpired
                true,                   // accountNonLocked

                AuthorityUtils.createAuthorityList(roleCds.toArray(String[]::new))
        );
        this.realUser = realUser;
    }

    /**
     * 퇴사 차단 정책
     * ACNT_ACT_YN = 'Y' 이고
     * EMP_STAT_CD != '퇴사' 일 때 로그인 허용
     * => 퇴사자는 로그인 불가
     */
    private static boolean isEnabled(EmpDTO emp) {

        boolean accountActive = "Y".equals(emp.getAcntActYn());
        boolean notRetired = !"퇴사".equals(emp.getEmpStatCd());

        return accountActive && notRetired;
    }

}
