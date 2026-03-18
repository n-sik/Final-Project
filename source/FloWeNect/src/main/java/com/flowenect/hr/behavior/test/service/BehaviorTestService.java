package com.flowenect.hr.behavior.test.service;

import java.util.List;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.behavior.EmpPickDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.req.BehaviorTestReq;
import com.flowenect.hr.dto.behavior.res.BehaviorTestRes;

public interface BehaviorTestService {

	List<TestMstDTO> readListBehaviorTest();

	BehaviorTestRes readBehaviorTest(String testNo);

	List<EmpDTO> readListEmpList(EmpDTO empDTO);

	/**
	 * 대상자 선택 모달용 목록 + 반기(상/하반기) 기준 완료 여부 포함
	 * @param testNo 
	 */
	List<EmpPickDTO> readEmpPickList(String testNo, EmpDTO empDTO);

	void createRspns(BehaviorTestReq req);
	
}
