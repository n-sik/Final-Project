package com.flowenect.hr.behavior.set.service;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.behavior.set.mapper.BehaviorSetMapper;
import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;
import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.req.BehaviorSetReq;
import com.flowenect.hr.dto.behavior.req.QuestionItemReq;
import com.flowenect.hr.dto.behavior.req.ResultReq;
import com.flowenect.hr.dto.behavior.req.SectionReq;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Slf4j
class BehaviorSetServiceImplTest {

	@Autowired
	private BehaviorSetMapper behaviorSetMapper;

	@Test
	@Transactional
	void testCreateBehavior() {

		BehaviorSetReq req = new BehaviorSetReq();
		req.setTestNm("CBTI");
		req.setTestDesc("회사 행동 16유형 타인 진단");

		// =====================
		// sections 생성
		// =====================
		List<SectionReq> sections = new ArrayList<>();

		// A. 영향력 방식
		SectionReq sec1 = new SectionReq();
		sec1.setId("sec_3bllitik");
		sec1.setQstNm("A. 영향력 방식");

		List<QuestionItemReq> qList1 = new ArrayList<>();

		QuestionItemReq q1 = new QuestionItemReq();
		q1.setId("q_l30atc60");
		q1.setItemCn("회의에서 이 사람은 자신의 의견을 먼저 제시하는 편이다");
		qList1.add(q1);

		QuestionItemReq q2 = new QuestionItemReq();
		q2.setId("q_snv5xv39");
		q2.setItemCn("문제가 생기면 직접 관련자에게 바로 이야기한다");
		qList1.add(q2);

		sec1.setQuestions(qList1);
		sections.add(sec1);

		// B. 판단 초점
		SectionReq sec2 = new SectionReq();
		sec2.setId("sec_towa0k8q");
		sec2.setQstNm("B. 판단 초점");

		List<QuestionItemReq> qList2 = new ArrayList<>();

		QuestionItemReq q3 = new QuestionItemReq();
		q3.setId("q_75e1qai9");
		q3.setItemCn("결과가 좋으면 과정의 문제는 크게 신경 쓰지 않는다");
		qList2.add(q3);

		QuestionItemReq q4 = new QuestionItemReq();
		q4.setId("q_fregee2d");
		q4.setItemCn("성과 수치에 민감하다");
		qList2.add(q4);

		sec2.setQuestions(qList2);
		sections.add(sec2);

		req.setSections(sections);

		// =====================
		// results 생성
		// =====================
		List<ResultReq> results = new ArrayList<>();

		ResultReq result = new ResultReq();
		result.setId("res_e03akcbe");
		result.setTypeCd("DRPS");
		result.setTypeNm("성과 지휘자");
		result.setTypeCn("회사에서 DRPS 유형은 조직을 실제로 움직이게 만드는 전면 실행자 역할을 한다.");

		results.add(result);

		req.setResults(results);

		log.info("BehaviorSetServiceImplTest****************************************************");
		log.info("{}", req);

		TestMstDTO testMstDTO = new TestMstDTO();
		testMstDTO.setTestNm(req.getTestNm());
		testMstDTO.setTestDesc(req.getTestDesc());
		testMstDTO.setWrtrEmpNo("2025001");

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
                type.setTypeNm(r.getTypeNm());
                type.setTypeCn(r.getTypeCn());

                behaviorSetMapper.insertBehaviorType(type);
            }
        }

		log.info("BehaviorSetServiceImplTest****************************************************");

	}

}
