package com.flowenect.hr.behavior.result.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsAnswerDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsDetailMstDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsSummaryDTO;
import com.flowenect.hr.dto.behavior.res.EmpViewDTO;

@Mapper
public interface BehaviorResultMapper {

	List<DeptDTO> selectDeptList();

	List<EmpViewDTO> selectEmpViewList();

	/** 단건 사원 조회(부서명/직위명 포함) - 셀프테스트 결과 모달용 */
	EmpViewDTO selectEmpViewByEmpNo(@Param("empNo") String empNo);

	List<BehaviorRspnsSummaryDTO> selectRspnsSummaryByTarget(
		@Param("empNo") String empNo,
		@Param("testNo") String testNo,
		@Param("startDate") java.sql.Date startDate,
		@Param("endDate") java.sql.Date endDate
	);

	BehaviorRspnsDetailMstDTO selectRspnsDetailMst(@Param("rspnsNo") int rspnsNo);

	/** RSPNS.ACTN_TYPE_RSLT 기준으로 BEHAVIOR_TYPE 리포트 조회 */
	BehaviorTypeDTO selectBehaviorTypeByRspnsNo(@Param("rspnsNo") int rspnsNo);

	/** TEST_NO + TYPE_CD 기준으로 BEHAVIOR_TYPE 리포트 조회(셀프테스트용) */
	BehaviorTypeDTO selectBehaviorTypeByTestAndTypeCd(
		@Param("testNo") int testNo,
		@Param("typeCd") String typeCd
	);

	List<BehaviorRspnsAnswerDTO> selectRspnsAnswers(@Param("rspnsNo") int rspnsNo);
}
