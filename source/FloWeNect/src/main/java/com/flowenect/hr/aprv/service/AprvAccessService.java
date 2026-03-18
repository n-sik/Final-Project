package com.flowenect.hr.aprv.service;

import org.springframework.stereotype.Service;

import com.flowenect.hr.aprv.mapper.AprvMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AprvAccessService {

    private final AprvMapper aprvMapper;

    public void assertDocAccess(long aprvNo, String empNo) {
        int ok = aprvMapper.existsDocAccess(aprvNo, empNo);
        if (ok == 0) {
            throw new IllegalStateException("문서 접근 권한이 없습니다.");
        }
    }
}
