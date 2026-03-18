package com.flowenect.hr.behavior.result.service;

import java.util.List;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorResultDetailRes;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsSummaryDTO;
import com.flowenect.hr.dto.behavior.res.EmpViewDTO;

public interface BehaviorResultService {

	List<DeptDTO> readDeptList();

	List<EmpViewDTO> readEmpViewList();

	List<TestMstDTO> readTestMstList();

	List<BehaviorRspnsSummaryDTO> readRspnsSummaries(String empNo, String testNo, String startDate, String endDate);

	BehaviorResultDetailRes readRspnsDetail(int rspnsNo);

	/**
	 * 셀프테스트 결과(저장 없이) 모달에 필요한 데이터 구성
	 * - testNo + typeCd 로 리포트 조회
	 * - mst는 화면 표시용으로 서버에서 생성(응답자/대상자 동일)
	 */
	BehaviorResultDetailRes readSelfResultDetail(String empNo, int testNo, String typeCd);
}
