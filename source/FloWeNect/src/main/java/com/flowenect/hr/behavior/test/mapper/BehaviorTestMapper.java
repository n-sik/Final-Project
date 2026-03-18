package com.flowenect.hr.behavior.test.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.behavior.EmpPickDTO;
import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.rspnsDTO;
import com.flowenect.hr.dto.behavior.rspnsRsltDTO;

@Mapper
public interface BehaviorTestMapper {

	TestMstDTO selectTestMst(String testNo);

	List<QuestionDTO> selectQuestions(String testNo);

	List<QuestionItemDTO> selectQuestionItems(String testNo);

	List<EmpDTO> selectListEmp(EmpDTO empDTO);

	List<EmpPickDTO> selectEmpPickList(
		@Param("testNo") String testNo,
		@Param("rspnrEmpNo") String rspnrEmpNo,
		@Param("deptCd") String deptCd,
		@Param("startDate") java.sql.Date startDate,
		@Param("endDate") java.sql.Date endDate
	);

	int countRspnsInHalf(
		@Param("testNo") String testNo,
		@Param("rspnrEmpNo") String rspnrEmpNo,
		@Param("trgtEmpNo") String trgtEmpNo,
		@Param("startDate") java.sql.Date startDate,
		@Param("endDate") java.sql.Date endDate
	);

	void insertRspns(rspnsDTO master);

	void insertRspnsRslt(rspnsRsltDTO row);

}
