package com.flowenect.hr.behavior.test.service;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.flowenect.hr.behavior.set.mapper.BehaviorSetMapper;
import com.flowenect.hr.behavior.test.mapper.BehaviorTestMapper;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.behavior.EmpPickDTO;
import com.flowenect.hr.dto.behavior.QuestionDTO;
import com.flowenect.hr.dto.behavior.QuestionItemDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.rspnsDTO;
import com.flowenect.hr.dto.behavior.rspnsRsltDTO;
import com.flowenect.hr.dto.behavior.req.BehaviorTestReq;
import com.flowenect.hr.dto.behavior.req.RspnsReq;
import com.flowenect.hr.dto.behavior.req.RspnsResultsReq;
import com.flowenect.hr.dto.behavior.res.BehaviorTestRes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BehaviorTestServiceImpl implements BehaviorTestService {

	private final BehaviorTestMapper behaviorTestMapper;
	private final BehaviorSetMapper behaviorSetMapper;

	@Override
	public List<TestMstDTO> readListBehaviorTest() {

		List<TestMstDTO> testMst = behaviorSetMapper.selectListTestMst();

		return testMst;
	}

	@Override
	@Transactional
	public BehaviorTestRes readBehaviorTest(String testNo) {

		log.info("BehaviorTestService.readBehaviorTest testNo={}", testNo);

		// 1️⃣ 테스트 기본 정보 조회
		TestMstDTO testMst = behaviorTestMapper.selectTestMst(testNo);

		if (testMst == null) {
			throw new IllegalArgumentException("존재하지 않는 testNo 입니다: " + testNo);
		}

		// 2️⃣ 질문 목록 조회
		List<QuestionDTO> questions = behaviorTestMapper.selectQuestions(testNo);

		// 3️⃣ 질문 항목 목록 조회
		List<QuestionItemDTO> questionItems = behaviorTestMapper.selectQuestionItems(testNo);

		// 5️⃣ Wrapper 객체 생성
		BehaviorTestRes res = new BehaviorTestRes();
		res.setTestMst(testMst);
		res.setQuestions(questions);
		res.setQuestionItems(questionItems);

		return res;

	}

	@Override
	public List<EmpDTO> readListEmpList(EmpDTO empDTO) {
		return behaviorTestMapper.selectListEmp(empDTO);
	}

	@Override
	public List<EmpPickDTO> readEmpPickList(String testNo, EmpDTO empDTO) {
		if (!StringUtils.hasText(testNo)) {
			throw new IllegalArgumentException("testNo is required.");
		}
	    if (empDTO == null || !StringUtils.hasText(empDTO.getEmpNo())) {
	        throw new IllegalArgumentException("login empNo is required.");
	    }

	    String rspnrEmpNo = empDTO.getEmpNo();
	    String deptCd = empDTO.getDeptCd();

	    HalfRange range = calcHalfRange(LocalDate.now());
	    
		return behaviorTestMapper.selectEmpPickList(
			testNo,
			rspnrEmpNo,
			deptCd,
			java.sql.Date.valueOf(range.start),
			java.sql.Date.valueOf(range.end)
		);
	}

	@Override
	@Transactional
	public void createRspns(BehaviorTestReq req) {

		// 1) validate
		if (req == null || req.getRspns() == null) {
			throw new IllegalArgumentException("rspns is required.");
		}
		if (req.getRspnsResults() == null || req.getRspnsResults().isEmpty()) {
			throw new IllegalArgumentException("rspnsResults is required.");
		}

		final RspnsReq r = req.getRspns();

		if (!StringUtils.hasText(r.getRspnrEmpNo())) throw new IllegalArgumentException("rspnrEmpNo is required.");
		if (!StringUtils.hasText(r.getTrgtEmpNo())) throw new IllegalArgumentException("trgtEmpNo is required.");
		if (!StringUtils.hasText(r.getTestNo())) throw new IllegalArgumentException("testNo is required.");

		// ✅ 반기 내 중복 응답 방지(서버에서도 차단)
		HalfRange range = calcHalfRange(LocalDate.now());
		int existsCnt = behaviorTestMapper.countRspnsInHalf(
			r.getTestNo(),
			r.getRspnrEmpNo(),
			r.getTrgtEmpNo(),
			java.sql.Date.valueOf(range.start),
			java.sql.Date.valueOf(range.end)
		);
		if (existsCnt > 0) {
			throw new IllegalStateException("이미 이번 반기에 해당 대상자에 대한 설문을 완료했습니다.");
		}

		// 2) insert master (RSPNS)
		rspnsDTO master = new rspnsDTO();
		master.setTestNo(parseIntRequired(r.getTestNo(), "testNo"));
		master.setRspnrEmpNo(r.getRspnrEmpNo());
		master.setTrgtEmpNo(r.getTrgtEmpNo());
		master.setActnTypeRslt(r.getActnTypeRslt());

		// mapper에서 master.rspnsNo 채워줘야 함 (selectKey/returning)
		behaviorTestMapper.insertRspns(master);

		final Integer rspnsNo = master.getRspnsNo();
		if (rspnsNo == null) {
			throw new IllegalStateException("Failed to generate rspnsNo.");
		}

		// 3) insert details (RSPNS_RSLT)
		List<RspnsResultsReq> details = req.getRspnsResults();

		for (RspnsResultsReq d : details) {
			if (d == null) continue;

			if (!StringUtils.hasText(d.getItemNo())) throw new IllegalArgumentException("itemNo is required.");
			if (!StringUtils.hasText(d.getRspnsVal())) throw new IllegalArgumentException("rspnsVal is required.");

			int itemNo = parseIntRequired(d.getItemNo(), "itemNo");
			int rspnsVal = parseIntRequired(d.getRspnsVal(), "rspnsVal");

			if (rspnsVal < 1 || rspnsVal > 5) {
				throw new IllegalArgumentException("rspnsVal must be between 1 and 5.");
			}

			rspnsRsltDTO row = new rspnsRsltDTO();
			row.setRspnsNo(rspnsNo);
			row.setItemNo(itemNo);
			row.setRspnsVal(rspnsVal);

			behaviorTestMapper.insertRspnsRslt(row);
		}
	}

	private int parseIntRequired(String v, String fieldName) {
		try {
			return Integer.parseInt(v);
		} catch (Exception e) {
			throw new IllegalArgumentException(fieldName + " must be a number.");
		}
	}

	/**
	 * 현재 날짜 기준 상/하반기 범위 계산
	 * - 상반기: 1/1 ~ 7/1
	 * - 하반기: 7/1 ~ (다음해)1/1
	 */
	private HalfRange calcHalfRange(LocalDate now) {
		int year = now.getYear();
		boolean firstHalf = now.getMonthValue() <= Month.JUNE.getValue();
		LocalDate start = firstHalf ? LocalDate.of(year, 1, 1) : LocalDate.of(year, 7, 1);
		LocalDate end = firstHalf ? LocalDate.of(year, 7, 1) : LocalDate.of(year + 1, 1, 1);
		return new HalfRange(start, end);
	}

	private static class HalfRange {
		final LocalDate start;
		final LocalDate end;
		HalfRange(LocalDate start, LocalDate end) {
			this.start = start;
			this.end = end;
		}
	}

}
