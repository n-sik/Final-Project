package com.flowenect.hr.behavior.set.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.AuthenticationUtils;

import com.flowenect.hr.behavior.set.mapper.BehaviorSetMapper;
import com.flowenect.hr.behavior.util.BehaviorUtil;
import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;
import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.req.BehaviorSetReq;
import com.flowenect.hr.dto.behavior.req.QuestionItemReq;
import com.flowenect.hr.dto.behavior.req.ResultReq;
import com.flowenect.hr.dto.behavior.req.SectionReq;
import com.flowenect.hr.dto.behavior.res.BehaviorSetRes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BehaviorSetServiceImpl implements BehaviorSetService {

	private final BehaviorSetMapper behaviorSetMapper;

	@Override
	@Transactional
	public void createBehavior(BehaviorSetReq req) {

		// 작성자 사번은 로그인 사용자로부터 주입

		TestMstDTO testMstDTO = new TestMstDTO();
		testMstDTO.setTestNm(req.getTestNm());
		testMstDTO.setTestDesc(req.getTestDesc());
		        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        EmpDTO loginUser = (auth != null && auth.isAuthenticated()) ? AuthenticationUtils.getRealUser(auth) : null;
        testMstDTO.setWrtrEmpNo(loginUser != null ? loginUser.getEmpNo() : null);

		int testMstResult = behaviorSetMapper.insertTestMst(testMstDTO);
		Integer testNo = testMstDTO.getTestNo();
		log.info("testMstResult: {}", testMstResult);
		log.info("testNo: {}", testNo);

		if (req.getSections() != null) {

			for (SectionReq sec : req.getSections()) {

				QuestionDTO questionDTO = new QuestionDTO();
				questionDTO.setTestNo(testNo);
				questionDTO.setQstNm(sec.getQstNm());

				behaviorSetMapper.insertQuestion(questionDTO);
				Integer qstNo = questionDTO.getQstNo();

				if (sec.getQuestions() != null && !sec.getQuestions().isEmpty()) {

//					List<QuestionItemDTO> items = new ArrayList<>();

					for (QuestionItemReq qi : sec.getQuestions()) {

//						QuestionItemDTO item = new QuestionItemDTO();
						QuestionItemDTO questionItemDTO = new QuestionItemDTO();
						questionItemDTO.setQstNo(qstNo);
						questionItemDTO.setItemCn(qi.getItemCn());
						questionItemDTO.setItemType(qi.getItemType());
//						item.setQstNo(qstNo);
//						item.setItemCn(qi.getItemCn());

//						behaviorSetMapper.insertQuestionItems(items);
						behaviorSetMapper.insertQuestionItems(questionItemDTO);

//						items.add(item);

					}

//					behaviorSetMapper.insertQuestionItems(items);
				}

			}

		}

		if (req.getResults() != null) {
			for (ResultReq r : req.getResults()) {

				BehaviorTypeDTO type = new BehaviorTypeDTO();
				type.setTypeCd(r.getTypeCd());
				type.setTestNo(testNo);
				type.setTypeNm(r.getTypeNm());
				type.setTypeCn(r.getTypeCn());

				behaviorSetMapper.insertBehaviorType(type);
			}
		}

	}

	@Override
	@Transactional
	public BehaviorSetRes readListBehaviorSet() {

		BehaviorSetRes res = new BehaviorSetRes();
		res.setTestMst(behaviorSetMapper.selectListTestMst());
		res.setQuestions(behaviorSetMapper.selectListQuestions());
		res.setQuestionItems(behaviorSetMapper.selectListQuestionItems());
		res.setBehaviorTypes(behaviorSetMapper.selectListBehaviorTypes());

		return res;
	}

	@Override
	@Transactional
	public void modifyBehavior(BehaviorSetReq req) {

		// json 구조의 최상위 testMst의 id 값을 조회
		log.info("{}", req);
		if (req.getId() == null || !req.getId().matches("^\\d+$")) {
			throw new IllegalArgumentException("수정 대상 검사 id(req.id)가 올바르지 않습니다.");
		}

		Integer testNo = Integer.valueOf(req.getId());

		// 1.
		// TEST_MST modify 진행
		TestMstDTO testMstDTO = new TestMstDTO();
		testMstDTO.setTestNo(testNo);
		testMstDTO.setTestNm(req.getTestNm());
		testMstDTO.setTestDesc(req.getTestDesc());
		behaviorSetMapper.updateTestMst(testMstDTO);

		// 2.
		// testNo기준 DB에 저장되어있는 PK 목록을 가져옴
		// 수정 하는 과정에서 발생하는 delete 하기위한 데이터를 구분하기 위함
		List<Integer> existingQstNos = behaviorSetMapper.selectQstNoListByTestNo(testNo);
		List<Integer> existingItemNos = behaviorSetMapper.selectItemNoListByTestNo(testNo);
		List<Integer> existingTypeNos = behaviorSetMapper.selectTypeNoListByTestNo(testNo);

		// 3.
		// req 에서 "숫자 PK"만 추출 (set은 PK를 담을곳 2개의 if문 에서 PK 를 set 에 담는구조)
		// 문자가 섞인 PK 라면 update가 아니기 때문
		Set<Integer> setQstNos = new HashSet<>();
		Set<Integer> setItemNos = new HashSet<>();
		Set<Integer> setTypeNos = new HashSet<>();

		if (req.getSections() != null) {
			for (SectionReq sec : req.getSections()) {

				if (BehaviorUtil.isPersistedId(sec.getId())) {
					setQstNos.add(Integer.valueOf(sec.getId()));
				}

				if (sec.getQuestions() != null) {
					for (QuestionItemReq qi : sec.getQuestions()) {
						if (BehaviorUtil.isPersistedId(qi.getId())) {
							setItemNos.add(Integer.valueOf(qi.getId()));
						}
					}
				}
			}
		}

		if (req.getResults() != null) {
			for (ResultReq r : req.getResults()) {
				if (BehaviorUtil.isPersistedId(r.getId())) {
					setTypeNos.add(Integer.valueOf(r.getId()));
				}
			}
		}

		// 4.
		// 수정내용중에 삭제한 항목이 있다면 수정과정에서 삭제처리도 되어야함
		// List 로 생성된 PK 목록을 Set으로 생성 > List - set 보다 set - set이 더 편하니까
		// DB에서 호출한 PK 목록에서 req에 있는 PK(id)를 빼면
		// 수정과정에서 삭제된 PK(id)만 남기 때문
		// 문자로시작하는 id의 경우 삭제대상이 아니기때문에 insert 할것
		Set<Integer> deleteQstNos = new HashSet<>(existingQstNos);
		deleteQstNos.removeAll(setQstNos);
		
		Set<Integer> deleteItemNos = new HashSet<>(existingItemNos);
		deleteItemNos.removeAll(setItemNos);

		Set<Integer> deleteTypeNos = new HashSet<>(existingTypeNos);
		deleteTypeNos.removeAll(setTypeNos);

		// 5.
		// upsert 진행 (문항 / 질문)
		// 숫자면 update 문자면 insert
		if (req.getSections() != null) {
			for (SectionReq sec : req.getSections()) {

				Integer qstNo;

				// 문항 upsert
				if (BehaviorUtil.isPersistedId(sec.getId())) {
					qstNo = Integer.valueOf(sec.getId());

					QuestionDTO qdto = new QuestionDTO();
					qdto.setQstNo(qstNo);
					qdto.setTestNo(testNo);
					qdto.setQstNm(sec.getQstNm());
					behaviorSetMapper.updateQuestion(qdto);

				} else {
					QuestionDTO qdto = new QuestionDTO();
					qdto.setTestNo(testNo);
					qdto.setQstNm(sec.getQstNm());
					behaviorSetMapper.insertQuestion(qdto); // insert 후 qdto.qstNo 채워짐
					qstNo = qdto.getQstNo();
				}

				// 질문 upsert
				if (sec.getQuestions() != null) {
					for (QuestionItemReq qi : sec.getQuestions()) {

						if (BehaviorUtil.isPersistedId(qi.getId())) {
							QuestionItemDTO item = new QuestionItemDTO();
							item.setItemNo(Integer.valueOf(qi.getId()));
							item.setQstNo(qstNo);
							item.setItemCn(qi.getItemCn());
							item.setItemType(qi.getItemType());
							behaviorSetMapper.updateQuestionItem(item);

						} else {
							QuestionItemDTO item = new QuestionItemDTO();
							item.setQstNo(qstNo);
							item.setItemCn(qi.getItemCn());
							item.setItemType(qi.getItemType());
							behaviorSetMapper.insertQuestionItems(item);
						}
					}
				}
			}
		}

		// 6.
		// upsert 진행 (결과)
		// 숫자면 update 문자면 insert
		if (req.getResults() != null) {
			for (ResultReq r : req.getResults()) {

				if (BehaviorUtil.isPersistedId(r.getId())) {
					BehaviorTypeDTO dto = new BehaviorTypeDTO();
					
					dto.setTypeNo(Integer.valueOf(r.getId()));
					dto.setTestNo(testNo);
					dto.setTypeCd(r.getTypeCd());
					dto.setTypeNm(r.getTypeNm());
					dto.setTypeCn(r.getTypeCn());
					behaviorSetMapper.updateBehaviorType(dto);

				} 
				else {
					BehaviorTypeDTO dto = new BehaviorTypeDTO();
					
					dto.setTestNo(testNo);
					dto.setTypeCd(r.getTypeCd());
					dto.setTypeNm(r.getTypeNm());
					dto.setTypeCn(r.getTypeCn());
					behaviorSetMapper.insertBehaviorType(dto);
					
				}
			}
		}

		// 7) diff delete (하위 삭제) : 자식 -> 부모 순서
		if (!deleteItemNos.isEmpty()) {
			behaviorSetMapper.deleteQuestionItemsByIds(deleteItemNos);
		}
		if (!deleteQstNos.isEmpty()) {
			behaviorSetMapper.deleteQuestionsByIds(deleteQstNos);
		}
		if (!deleteTypeNos.isEmpty()) {
			behaviorSetMapper.deleteBehaviorTypesByIds(deleteTypeNos);
		}

	}

	@Override
	@Transactional
	public void deleteBehavior(Integer testNo) {
	    if (testNo == null) return;

	    // ✅ 기존에 이미 있는 "testNo로 PK 목록 조회" 메서드 재사용
	    List<Integer> qstNos = behaviorSetMapper.selectQstNoListByTestNo(testNo);
	    List<Integer> itemNos = behaviorSetMapper.selectItemNoListByTestNo(testNo);
	    List<Integer> typeNos = behaviorSetMapper.selectTypeNoListByTestNo(testNo);

	    // ✅ 기존에 만들어둔 delete...ByIds(Set/List) 메서드 그대로 사용
	    if (itemNos != null && !itemNos.isEmpty()) {
	        behaviorSetMapper.deleteQuestionItemsByIds(new HashSet<>(itemNos));
	    }
	    if (qstNos != null && !qstNos.isEmpty()) {
	        behaviorSetMapper.deleteQuestionsByIds(new HashSet<>(qstNos));
	    }
	    if (typeNos != null && !typeNos.isEmpty()) {
	        behaviorSetMapper.deleteBehaviorTypesByIds(new HashSet<>(typeNos));
	    }

	    // ✅ 마지막에 마스터 삭제
	    behaviorSetMapper.deleteTestMstByTestNo(testNo);
	}


}
