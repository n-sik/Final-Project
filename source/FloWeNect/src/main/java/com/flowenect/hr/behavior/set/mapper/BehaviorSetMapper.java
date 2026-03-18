package com.flowenect.hr.behavior.set.mapper;

import java.util.List;
import java.util.Set;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;
import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;

@Mapper
public interface BehaviorSetMapper {

	// 검사 종류 삽입
	int insertTestMst(TestMstDTO dto);

	// 문항 삽입
	int insertQuestion(QuestionDTO dto);

	// 문항 목록 삽입
//	int insertQuestionItems(@Param("items") List<QuestionItemDTO> items);
	int insertQuestionItems(QuestionItemDTO dto);

	// 결과 삽입
	int insertBehaviorType(BehaviorTypeDTO dto);

	// 검사 종류 전체 조회
	List<TestMstDTO> selectListTestMst();

	// 문항 전체 조회
	List<QuestionDTO> selectListQuestions();

	// 질문 전체 조회
	List<QuestionItemDTO> selectListQuestionItems();

	// 결과 전체 조회
	List<BehaviorTypeDTO> selectListBehaviorTypes();

	// 검사 종류 업데이트
	void updateTestMst(TestMstDTO testMstDTO);
	
	// 문항 업데이트
	void updateQuestion(QuestionDTO qdto);

	// 질문 업데이트
	void updateQuestionItem(QuestionItemDTO item);
	
	// 결과 업데이트
	void updateBehaviorType(BehaviorTypeDTO dto);

	// 수정과정중 발생하는 삭제 항목을 추출하기 위한 PK 목록 조회
	// 검사종류는 단건(1개) 이기 때문에 목록없어도 됨
	List<Integer> selectQstNoListByTestNo(@Param("testNo") Integer testNo);
	List<Integer> selectItemNoListByTestNo(@Param("testNo") Integer testNo);
	List<Integer> selectTypeNoListByTestNo(@Param("testNo") Integer testNo);

	// 검사 종류 삭제
	// {검사 종류 삭제는 수정과정이 아닌 별도 삭제 로직 생성 예정}
	
	// 문항 삭제
	void deleteQuestionsByIds(Set<Integer> deleteQstNos);

	// 질문 삭제
	void deleteQuestionItemsByIds(Set<Integer> deleteItemNos);

	// 결과 삭제
	void deleteBehaviorTypesByIds(Set<Integer> deleteTypeNos);

	void deleteTestMstByTestNo(Integer testNo);

	


	
	

}
