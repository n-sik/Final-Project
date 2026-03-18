package com.flowenect.hr.data.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowenect.hr.data.mapper.AttendLogMapper;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.common.PagedResponse;
import com.flowenect.hr.dto.common.SearchRequest;
import com.flowenect.hr.dto.data.ResponseAttendanceDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendLogServiceImpl implements AttendLogService {

    private final AttendLogMapper attendLogMapper;
    
    /**
     * [조직도] 부서 목록 조회
     */
    @Override
    public List<DeptDTO> readActiveDeptList() {
        return attendLogMapper.selectActiveDeptList();
    }

    /**
     * [조직도] 부서별 사원 조회 (지연 로딩)
     */
    @Override
    public List<EmpDTO> readEmpListByDept(String deptCd) {
        return attendLogMapper.selectEmpListByDept(deptCd);
    }
    
    /**
     * [근태] 근태 기록 조회 (페이징 포함)
     */
    @Override
    public PagedResponse<ResponseAttendanceDTO> readAttendLogList(SearchRequest searchRequest) {
        int totalCount = attendLogMapper.selectAttendLogCount(searchRequest);
        
        searchRequest.getPaging().setTotalCount(totalCount);
        
        List<ResponseAttendanceDTO> list = attendLogMapper.selectAttendLogList(searchRequest);
        
        return PagedResponse.of(list, searchRequest.getPaging());
    }
    
    /**
     * [근태] 오늘 기록 조회
     */
    @Override
    public AttendanceDTO readTodayAttend(String empNo) {
        return attendLogMapper.selectTodayAttend(empNo);
    }
}