package com.flowenect.hr.behavior.result.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.flowenect.hr.behavior.result.mapper.BehaviorResultMapper;
import com.flowenect.hr.behavior.set.mapper.BehaviorSetMapper;
import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.behavior.BehaviorTypeDTO;
import com.flowenect.hr.dto.behavior.TestMstDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorResultDetailRes;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsAnswerDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsDetailMstDTO;
import com.flowenect.hr.dto.behavior.res.BehaviorRspnsSummaryDTO;
import com.flowenect.hr.dto.behavior.res.EmpViewDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BehaviorServiceImpl implements BehaviorResultService {

	private final BehaviorResultMapper behaviorResultMapper;
	private final BehaviorSetMapper behaviorSetMapper;

	@Override
	public List<DeptDTO> readDeptList() {
		return behaviorResultMapper.selectDeptList();
	}

	@Override
	public List<EmpViewDTO> readEmpViewList() {
		return behaviorResultMapper.selectEmpViewList();
	}

	@Override
	public List<TestMstDTO> readTestMstList() {
		// 기존 set 화면에서 사용 중인 테스트 목록을 그대로 재사용
		return behaviorSetMapper.selectListTestMst();
	}

	@Override
	public List<BehaviorRspnsSummaryDTO> readRspnsSummaries(String empNo, String testNo, String startDate, String endDate) {
		if (!StringUtils.hasText(empNo)) {
			throw new IllegalArgumentException("empNo is required.");
		}

		DateRange r = resolveRange(startDate, endDate);

		return behaviorResultMapper.selectRspnsSummaryByTarget(
			empNo,
			StringUtils.hasText(testNo) ? testNo : null,
			java.sql.Date.valueOf(r.start),
			java.sql.Date.valueOf(r.end)
		);
	}

	@Override
	public BehaviorResultDetailRes readRspnsDetail(int rspnsNo) {
		BehaviorRspnsDetailMstDTO mst = behaviorResultMapper.selectRspnsDetailMst(rspnsNo);
		if (mst == null) {
			throw new IllegalArgumentException("존재하지 않는 rspnsNo 입니다: " + rspnsNo);
		}

		BehaviorTypeDTO type = behaviorResultMapper.selectBehaviorTypeByRspnsNo(rspnsNo);
		List<BehaviorRspnsAnswerDTO> answers = behaviorResultMapper.selectRspnsAnswers(rspnsNo);
		BehaviorResultDetailRes res = new BehaviorResultDetailRes();
		res.setType(type);
		res.setMst(mst);
		res.setAnswers(answers);
		return res;
	}

	@Override
	public BehaviorResultDetailRes readSelfResultDetail(String empNo, int testNo, String typeCd) {
		if (!StringUtils.hasText(empNo)) {
			throw new IllegalArgumentException("empNo is required.");
		}
		if (!StringUtils.hasText(typeCd)) {
			throw new IllegalArgumentException("typeCd is required.");
		}

		BehaviorTypeDTO type = behaviorResultMapper.selectBehaviorTypeByTestAndTypeCd(testNo, typeCd);
		if (type == null) {
			throw new IllegalArgumentException("존재하지 않는 행동유형 입니다: testNo=" + testNo + ", typeCd=" + typeCd);
		}

		// 화면 상단 표시용(응답자/대상자 동일)
		EmpViewDTO emp = behaviorResultMapper.selectEmpViewByEmpNo(empNo);
		String empNm = emp != null ? emp.getEmpNm() : empNo;
		String deptNm = emp != null ? emp.getDeptNm() : null;
		String posNm = emp != null ? emp.getPosNm() : null;

		// testNm/testDesc는 set 화면에서 쓰는 목록을 재사용
		String testNm = null;
		String testDesc = null;
		List<TestMstDTO> tests = behaviorSetMapper.selectListTestMst();
		for (TestMstDTO t : tests) {
			if (t != null && Objects.equals(t.getTestNo(), testNo)) {
				testNm = t.getTestNm();
				testDesc = t.getTestDesc();
				break;
			}
		}

		BehaviorRspnsDetailMstDTO mst = BehaviorRspnsDetailMstDTO.builder()
			.rspnsNo(null)
			.testNo(testNo)
			.testNm(testNm)
			.testDesc(testDesc)
			.rspnrEmpNo(empNo)
			.rspnrEmpNm(empNm)
			.rspnrDeptNm(deptNm)
			.rspnrPosNm(posNm)
			.trgtEmpNo(empNo)
			.trgtEmpNm(empNm)
			.trgtDeptNm(deptNm)
			.trgtPosNm(posNm)
			.rspnsDtm(LocalDateTime.now())
			.actnTypeRslt(typeCd)
			.build();

		BehaviorResultDetailRes res = new BehaviorResultDetailRes();
		res.setType(type);
		res.setMst(mst);
		res.setAnswers(List.of()); // 셀프테스트는 저장하지 않으므로 상세 응답은 비워둠
		return res;
	}

	private static final DateTimeFormatter DF = DateTimeFormatter.ofPattern("yyyy-MM-dd");

	private DateRange resolveRange(String startDate, String endDate) {
		// 입력이 둘 다 있으면 그대로 사용
		if (StringUtils.hasText(startDate) && StringUtils.hasText(endDate)) {
			LocalDate s = LocalDate.parse(startDate, DF);
			LocalDate e = LocalDate.parse(endDate, DF);
			if (!e.isAfter(s)) {
				throw new IllegalArgumentException("endDate must be after startDate.");
			}
			return new DateRange(s, e);
		}

		// 하나만 입력된 경우에도 반기 기본값으로 보정
		LocalDate now = LocalDate.now();
		boolean firstHalf = now.getMonthValue() <= Month.JUNE.getValue();
		LocalDate s = firstHalf ? LocalDate.of(now.getYear(), 1, 1) : LocalDate.of(now.getYear(), 7, 1);
		LocalDate e = firstHalf ? LocalDate.of(now.getYear(), 7, 1) : LocalDate.of(now.getYear() + 1, 1, 1);

		return new DateRange(s, e);
	}

	private static class DateRange {
		final LocalDate start;
		final LocalDate end;
		DateRange(LocalDate start, LocalDate end) {
			this.start = start;
			this.end = end;
		}
	}
}
