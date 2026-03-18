package com.flowenect.hr.security.listener;

import com.flowenect.hr.emp.mapper.EmpMapper;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;

/**
 * 세션 만료/서버종료 등으로 세션이 파괴되는 경우 ACCESS_LOG에 종료 처리를 남긴다.
 *
 * - 로그아웃(버튼)은 AccessLogLogoutHandler에서 처리하며,
 *   해당 핸들러가 ACCESS_LOG_NO를 세션에서 제거하므로 여기서는 중복 업데이트를 피할 수 있다.
 */
public class AccessLogSessionListener implements HttpSessionListener {

    private final EmpMapper empMapper;

    public AccessLogSessionListener(EmpMapper empMapper) {
        this.empMapper = empMapper;
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        try {
            Object accessLogNoObj = se.getSession().getAttribute("ACCESS_LOG_NO");
            if (accessLogNoObj == null) return;

            Long accessLogNo;
            if (accessLogNoObj instanceof Long l) {
                accessLogNo = l;
            } else {
                accessLogNo = Long.parseLong(String.valueOf(accessLogNoObj));
            }

            empMapper.updateAccessLogTimeout(accessLogNo, "TIMEOUT");
        } catch (Exception ignore) {
        }
    }
}
