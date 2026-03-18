package com.flowenect.hr.payroll.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.payroll.EmailPreviewDTO;
import com.flowenect.hr.dto.payroll.EmpPayInfoDTO;
import com.flowenect.hr.dto.payroll.EmpSalaryItemDTO;
import com.flowenect.hr.dto.payroll.EmployeeInfoDTO;
import com.flowenect.hr.dto.payroll.EmployeePayrollRowDTO;
import com.flowenect.hr.dto.payroll.GradeBaseAmtDTO;
import com.flowenect.hr.dto.payroll.InsuranceRateDTO;
import com.flowenect.hr.dto.payroll.PayrollDetailDTO;
import com.flowenect.hr.dto.payroll.PayrollHeaderDTO;
import com.flowenect.hr.dto.payroll.PayrollItemDTO;
import com.flowenect.hr.dto.payroll.PayrollListRowDTO;
import com.flowenect.hr.dto.payroll.PositionDTO;
import com.flowenect.hr.dto.payroll.SalaryItemDTO;
import com.flowenect.hr.dto.payroll.StepRateDTO;
import com.flowenect.hr.payroll.mapper.PayrollMapper;
import com.flowenect.hr.payroll.util.PayrollExcelUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PayrollServiceImpl implements PayrollService {

	private static final Logger log = LoggerFactory.getLogger(PayrollServiceImpl.class);

	private final PayrollMapper payrollMapper;
	private final PayrollPdfService payrollPdfService;
	private final PayrollMailService payrollMailService;

	private static final DateTimeFormatter YMD = DateTimeFormatter.ofPattern("yyyy-MM-dd");
	private static final String OPEN_END = "9999-12-31";

	// ===== 관리(마스터/사원별) =====

	@Override
	public List<EmployeePayrollRowDTO> getEmployeeRows() {
		return payrollMapper.selectEmployeePayrollRows();
	}

	@Override
	public List<PositionDTO> getPositions() {
		return payrollMapper.selectPositions();
	}

	@Override
	public EmpPayInfoDTO getCurrentEmpPayInfo(String empNo) {
		EmpPayInfoDTO dto = payrollMapper.selectCurrentEmpBase(empNo);
		if (dto == null) {
			dto = new EmpPayInfoDTO();
			dto.setEmpNo(empNo);
			// 화면용 기본값(오늘)
			dto.setStartDtm(LocalDate.now().format(YMD));
			dto.setEndDtm(OPEN_END);
		}
		return dto;
	}

	@Override
	public List<EmpPayInfoDTO> getEmpPayInfoHistory(String empNo) {
		return payrollMapper.selectEmpBaseHistory(empNo);
	}

	/**
	 * ✅ 개인 기준금액 저장 규칙 (수정하는 날 기준)
	 *
	 * 1) 현재 열린 행(END=9999-12-31)이 없으면: INSERT (START=오늘, END=9999-12-31) 2) 현재 열린
	 * 행이 있고, 그 행의 START가 오늘이면: UPDATE 3) 현재 열린 행이 있고, 그 행의 START가 오늘이 아니면: - 기존 행
	 * END = 어제(오늘-1일)로 닫고 - 새 행 INSERT (START=오늘, END=9999-12-31)
	 *
	 * ⚠️ 화면의 "적용일" 입력값은 저장 판단/기간에 사용하지 않는다. (너가 말한 기준은 '수정을 하는 날' 이기 때문)
	 */
	@Override
	@Transactional
	public void saveEmpPayInfo(String empNo, EmpPayInfoDTO body) {
		body.setEmpNo(empNo);
		body.setBankName(trimToNull(body.getBankName()));
		body.setAccntNo(trimToNull(body.getAccntNo()));
		body.setAdjustRsn(trimToNull(body.getAdjustRsn()));

		if (body.getBaseAmt() != null && body.getBaseAmt() <= 0) {
			throw new IllegalArgumentException("개인 기준금액은 0보다 큰 금액만 입력할 수 있습니다.");
		}

		// "수정하는 날" 기준
		LocalDate today = LocalDate.now();
		String todayStr = today.format(YMD);
		String yesterdayStr = today.minusDays(1).format(YMD);

		// 저장되는 START/END는 항상 (오늘 ~ 9999-12-31)
		body.setStartDtm(todayStr);
		body.setEndDtm(OPEN_END);

		// 현재 열린(END=9999-12-31) 행
		EmpPayInfoDTO open = payrollMapper.selectOpenEmpBase(empNo);

		// 3) 신규 등록(현재행 자체가 없는 경우) -> INSERT
		if (open == null || open.getPaySeq() == null) {
			body.setPaySeq(null);
			payrollMapper.mergeEmpBase(body); // INSERT
			return;
		}

		// 열린 행의 START가 오늘이면 -> UPDATE
		LocalDate openStart = null;
		try {
			if (!isBlank(open.getStartDtm())) {
				openStart = LocalDate.parse(open.getStartDtm().trim(), YMD);
			}
		} catch (Exception ignore) {
			openStart = null;
		}

		// 1) “오늘 수정” && 기존 현재행 START가 오늘과 동일 -> UPDATE
		if (openStart != null && openStart.isEqual(today)) {
			body.setPaySeq(open.getPaySeq());
			payrollMapper.mergeEmpBase(body); // UPDATE
			return;
		}

		// 2) 그 외(오늘이 아닌 경우) -> 기존행 닫고 INSERT 누적
		payrollMapper.updateEmpBaseEndDtm(open.getPaySeq(), yesterdayStr);

		body.setPaySeq(null);
		payrollMapper.mergeEmpBase(body); // INSERT
	}

	@Override
	public List<EmpSalaryItemDTO> getCurrentEmpSalaryItems(String empNo) {
		return payrollMapper.selectCurrentEmpAllowances(empNo);
	}

	@Override
	@Transactional
	public void replaceEmpSalaryItems(String empNo, List<EmpSalaryItemDTO> items) {
		payrollMapper.deleteEmpAllowances(empNo);
		if (items == null)
			return;
		for (EmpSalaryItemDTO i : items) {
			i.setEmpNo(empNo);
			if (isBlank(i.getStartDtm()))
				i.setStartDtm(LocalDate.now().format(YMD));
			if (isBlank(i.getEndDtm()))
				i.setEndDtm(OPEN_END);
			payrollMapper.insertEmpAllowance(i);
		}
	}

	@Override
	public GradeBaseAmtDTO getGradeBaseAmt(String posCd) {
		GradeBaseAmtDTO dto = payrollMapper.selectPosBaseAmt(posCd);
		if (dto == null) {
			dto = new GradeBaseAmtDTO();
			dto.setPosCd(posCd);
			dto.setStartDtm(LocalDate.now().format(YMD));
			dto.setEndDtm(OPEN_END);
		}
		return dto;
	}

	@Override
	public List<GradeBaseAmtDTO> getGradeBaseAmtList() {
		return payrollMapper.selectPosBaseAmtList();
	}

	@Override
	public List<GradeBaseAmtDTO> getGradeBaseAmtHistory(String posCd) {
		return payrollMapper.selectPosBaseAmtHistory(posCd);
	}

	@Override
	@Transactional
	public void saveGradeBaseAmt(GradeBaseAmtDTO dto) {
		if (dto == null)
			return;
		if (isBlank(dto.getPosCd()))
			return;

		final String today = LocalDate.now().format(YMD);
		final String yesterday = LocalDate.now().minusDays(1).format(YMD);

		// 화면 입력 '적용일'은 수정 불가이며, 저장 판단은 '오늘' 기준
		dto.setStartDtm(today);
		dto.setEndDtm(OPEN_END);

		GradeBaseAmtDTO open = payrollMapper.selectOpenPosBaseAmt(dto.getPosCd());

		if (open == null) {
			// 최초 생성
			dto.setBaseAmtNo(null);
			payrollMapper.mergePosBaseAmt(dto);
			return;
		}

		if (Objects.equals(open.getStartDtm(), today)) {
			// 오늘 시작한 행이면 UPDATE
			dto.setBaseAmtNo(open.getBaseAmtNo());
			payrollMapper.mergePosBaseAmt(dto);
			return;
		}

		// 다른 날 시작한 열린 행이면: 기존 닫고 새로 생성
		payrollMapper.updatePosBaseAmtEndDtm(open.getBaseAmtNo(), yesterday);
		dto.setBaseAmtNo(null);
		payrollMapper.mergePosBaseAmt(dto);
	}

	@Override
	public List<StepRateDTO> getStepRates() {
		return payrollMapper.selectStepRates();
	}

	@Override
	@Transactional
	public void replaceStepRates(List<StepRateDTO> items) {
		final String today = LocalDate.now().format(YMD);
		final String yesterday = LocalDate.now().minusDays(1).format(YMD);

		String openStart = payrollMapper.selectOpenStepSetStartDtm(); // '열린 세트' 시작일(없으면 null)

		if (openStart != null && openStart.equals(today)) {
			// 오늘 세트를 다시 저장하는 경우: 오늘 세트 삭제 후 재삽입(=update 효과)
			payrollMapper.deleteStepRatesByStartDtm(today);
		} else {
			// 기존 열린 세트가 있으면 닫고 새 세트 생성
			if (openStart != null) {
				payrollMapper.updateOpenStepSetEndDtm(yesterday);
			}
		}

		if (items == null)
			return;

		for (StepRateDTO r : items) {
			if (r == null)
				continue;
			if (r.getSalaryStep() == null)
				continue;
			if (r.getIncreaseRate() == null)
				r.setIncreaseRate(0.0);
			if (isBlank(r.getUseYn()))
				r.setUseYn("Y");

			r.setStartDtm(today);
			r.setEndDtm(OPEN_END);

			payrollMapper.insertStepRate(r);
		}
	}

	@Override
	public List<SalaryItemDTO> getSalaryItems() {
		return payrollMapper.selectAllowanceDefs();
	}

	@Override
	@Transactional
	public SalaryItemDTO upsertSalaryItem(SalaryItemDTO dto) {
		if (dto == null)
			return null;

		// upsert(MERGE)로 처리하되, 신규일 때는 시퀀스로 코드를 먼저 채번해서 NOT NULL 위반을 방지
		if (isBlank(dto.getSalaryItemCode())) {
			dto.setSalaryItemCode(payrollMapper.nextSalaryItemCode());
		}

		payrollMapper.mergeAllowanceDef(dto);
		return dto;
	}

	@Override
	public List<InsuranceRateDTO> getInsuranceRates() {
		// 그리드용: DB에 데이터가 없으면 빈 배열([]) 반환
		return payrollMapper.selectDeductionRatesList();
	}

	@Override
	public InsuranceRateDTO getCurrentInsuranceRate() {
		InsuranceRateDTO dto = payrollMapper.selectDeductionRates();
		if (dto == null) {
			dto = new InsuranceRateDTO();
			dto.setStartDtm(LocalDate.now().format(YMD));
			dto.setEndDtm(OPEN_END);
		}
		return dto;
	}

	@Override
	@Transactional
	public void upsertInsuranceRate(InsuranceRateDTO dto) {
		if (dto == null)
			return;

		final String today = LocalDate.now().format(YMD);
		final String yesterday = LocalDate.now().minusDays(1).format(YMD);

		dto.setStartDtm(today);
		dto.setEndDtm(OPEN_END);

		InsuranceRateDTO open = payrollMapper.selectOpenDeductionRate();

		if (open == null) {
			dto.setRateNo(null);
			payrollMapper.mergeDeductionRate(dto);
			return;
		}

		if (Objects.equals(open.getStartDtm(), today)) {
			dto.setRateNo(open.getRateNo());
			payrollMapper.mergeDeductionRate(dto);
			return;
		}

		payrollMapper.updateDeductionRateEndDtm(open.getRateNo(), yesterday);
		dto.setRateNo(null);
		payrollMapper.mergeDeductionRate(dto);
	}

	// ===== 명세서 =====

	@Override
	public List<PayrollListRowDTO> getPayrollList(String fromYm, String toYm) {
		return payrollMapper.selectPayrollList(fromYm, toYm);
	}

	@Override
	@Transactional
	public void generateStatements(String payYyyymm) {
		java.time.LocalDate baseDateLd = java.time.YearMonth.parse(payYyyymm, java.time.format.DateTimeFormatter.ofPattern("yyyyMM")).atEndOfMonth();
		java.util.Date baseDate = java.sql.Date.valueOf(baseDateLd);
		List<EmployeePayrollRowDTO> emps = payrollMapper.selectEmployeesForPayrollGeneration(baseDate);
		for (EmployeePayrollRowDTO e : emps) {
			int cnt = payrollMapper.selectPayrollExists(e.getEmpNo(), payYyyymm);
			if (cnt > 0)
				continue;

			// 계산 후 PAYROLL 생성
			PayrollCalcResult calc = calculateForEmployee(e.getEmpNo(), payYyyymm);

			PayrollHeaderDTO header = new PayrollHeaderDTO();
			header.setEmpNo(e.getEmpNo());
			header.setPayYyyymm(payYyyymm);
			header.setTotalPayAmt(calc.totalPayAmt);
			header.setTotalDeductAmt(calc.totalDeductAmt);
			header.setNetPayAmt(calc.netPayAmt);
			payrollMapper.insertPayroll(header); // selectKey로 payrollNo 세팅됨

			// 상세 생성
			for (PayrollItemDTO item : calc.items) {
				item.setPayrollNo(header.getPayrollNo());
				payrollMapper.insertPayrollItem(item);
			}
		}
	}

	@Override
	public PayrollDetailDTO getPayrollDetail(Long payrollNo) {
		PayrollHeaderDTO header = payrollMapper.selectPayrollHeader(payrollNo);
		if (header == null)
			return new PayrollDetailDTO();

		EmployeeInfoDTO emp = payrollMapper.selectEmpInfo(header.getEmpNo());
		PayrollDetailDTO detail = new PayrollDetailDTO();
		detail.setPayrollNo(header.getPayrollNo());
		detail.setPayYyyymm(header.getPayYyyymm());
		detail.setCreatedDtm(header.getCreatedDtm());
		detail.setConfirmYn(header.getConfirmYn());
		detail.setEmpNo(header.getEmpNo());
		if (emp != null) {
			detail.setEmpNm(emp.getEmpNm());
			detail.setDeptNm(emp.getDeptNm());
			detail.setPosNm(emp.getPosNm());
			detail.setEmail(emp.getEmail());
		}
		detail.setItems(payrollMapper.selectPayrollItems(payrollNo));
		return detail;
	}

	@Override
	@Transactional
	public void updatePayrollDetail(Long payrollNo, List<PayrollItemDTO> items) {
		if (items == null)
			return;
		for (PayrollItemDTO i : items) {
			if (i.getItemDetailNo() == null)
				continue;
			payrollMapper.updatePayrollItemAmount(i.getItemDetailNo(), i.getAmount());
		}
		rebuildTotals(payrollNo);
	}

	@Override
	@Transactional
	public void confirmStatements(List<Long> payrollNos) {
		if (payrollNos == null || payrollNos.isEmpty())
			return;
		for (Long id : payrollNos) {
			payrollMapper.updatePayrollConfirmYn(id, "Y");

			// ✅ 확정 시점에 급여명세서 Excel/PDF 생성 후 사원 이메일로 발송
			//    - 첨부 생성 실패/메일 실패가 확정 자체를 막지 않도록 항상 예외를 삼키되,
			//      운영에서 원인 파악 가능하도록 로그는 남긴다.
			try {
				PayrollDetailDTO detail = getPayrollDetail(id);
				EmployeeInfoDTO emp = null;
				try {
					emp = payrollMapper.selectEmpInfo(detail.getEmpNo());
					if (emp != null) {
						detail.setEmpNm(emp.getEmpNm());
						detail.setDeptNm(emp.getDeptNm());
						detail.setPosNm(emp.getPosNm());
						detail.setEmail(emp.getEmail());
					}
				} catch (Exception e) {
					log.warn("[PAYROLL] confirmStatements: 사원 정보 조회 실패 payrollNo={}", id, e);
				}

				String to = (emp != null && emp.getEmail() != null) ? emp.getEmail() : detail.getEmail();
				if (to == null || to.isBlank()) {
					log.info("[PAYROLL] confirmStatements: 이메일이 없어 발송 생략 payrollNo={} empNo={}", id, detail.getEmpNo());
					continue;
				}

				// 메일 제목/본문은 기존 프리뷰 템플릿을 재사용
				EmailPreviewDTO preview = null;
				try {
					preview = getEmailPreview(id);
				} catch (Exception e) {
					log.warn("[PAYROLL] confirmStatements: 이메일 프리뷰 생성 실패 payrollNo={}", id, e);
				}
				String subject = preview != null ? nvl(preview.getSubject(), "")
						: String.format("[%s] 급여명세서 (%s)", nvl(detail.getPayYyyymm(), ""), nvl(detail.getEmpNm(), ""));
				String body = preview != null ? nvl(preview.getBody(), "")
						: ("안녕하세요 " + nvl(detail.getEmpNm(), "") + "님\n\n" + nvl(detail.getPayYyyymm(), "")
								+ " 급여명세서를 첨부드립니다.\n\n" + "감사합니다.\n");

				byte[] xlsx = null;
				try {
					xlsx = getPayrollExcel(id);
				} catch (Exception e) {
					log.error("[PAYROLL] confirmStatements: Excel 생성 실패 payrollNo={}", id, e);
				}
				byte[] pdf = null;
				try {
					pdf = getPayrollPdf(id);
				} catch (Exception e) {
					log.error("[PAYROLL] confirmStatements: PDF 생성 실패 payrollNo={}", id, e);
				}

				if ((xlsx == null || xlsx.length == 0) && (pdf == null || pdf.length == 0)) {
					log.warn("[PAYROLL] confirmStatements: 첨부파일 생성 실패로 발송 생략 payrollNo={}", id);
					continue;
				}

				String baseName = String.format("payroll_%s_%s", nvl(detail.getPayYyyymm(), ""), nvl(detail.getEmpNo(), ""));
				String xlsxName = baseName + ".xlsx";
				String pdfName = baseName + ".pdf";

				if (xlsx != null && xlsx.length > 0 && pdf != null && pdf.length > 0) {
					payrollMailService.sendPayrollExcelAndPdf(to, subject, body, xlsx, xlsxName, pdf, pdfName);
				} else if (xlsx != null && xlsx.length > 0) {
					payrollMailService.sendPayrollExcel(to, subject, body, xlsx, xlsxName);
				} else {
					payrollMailService.sendPayrollPdf(to, subject, body, pdf, pdfName);
				}
			} catch (Exception e) {
				log.error("[PAYROLL] confirmStatements: 메일 발송 처리 중 오류 payrollNo={}", id, e);
			}
		}
	}

	@Override
	public byte[] getPayrollPdf(Long payrollNo) {
		PayrollDetailDTO d = getPayrollDetail(payrollNo);
		return payrollPdfService.renderPdf(d);
	}

	@Override
	@Transactional
	public void deleteStatements(List<Long> payrollNos) {
		if (payrollNos == null || payrollNos.isEmpty())
			return;
		for (Long id : payrollNos) {
			payrollMapper.deletePayrollItems(id);
		}
		payrollMapper.deletePayrolls(payrollNos);
	}

	@Override
	public byte[] getPayrollExcel(Long payrollNo) {
	    PayrollDetailDTO d = getPayrollDetail(payrollNo);
	    return PayrollExcelUtil.toXlsx(d);
	}
	
	@Override
	public EmailPreviewDTO getEmailPreview(Long payrollNo) {
		PayrollDetailDTO d = getPayrollDetail(payrollNo);
		String payYm = nvl(d.getPayYyyymm(), "");
		String empNm = nvl(d.getEmpNm(), "");
		String subject = String.format("[%s] 급여명세서 (%s)", payYm, empNm);

		long paySum = 0L;
		long dedSum = 0L;

		StringBuilder payLines = new StringBuilder();
		StringBuilder dedLines = new StringBuilder();
		if (d.getItems() != null) {
			for (PayrollItemDTO i : d.getItems()) {
				if (i == null) continue;
				String type = nvl(i.getItemTypeCd(), "").trim().toUpperCase();
				if ("TOTAL".equals(type)) continue;
				long amt = i.getAmount() == null ? 0L : i.getAmount();
				String line = String.format("- %s: %,d\n", nvl(i.getItemName(), ""), amt);
				if ("PAY".equals(type) || "지급".equals(nvl(i.getItemTypeCd(), "").trim())) {
					payLines.append(line);
					paySum += amt;
				} else if ("DEDUCT".equals(type) || "공제".equals(nvl(i.getItemTypeCd(), "").trim()) || "DED".equals(type)) {
					dedLines.append(line);
					dedSum += amt;
				}
			}
		}
		long net = paySum - dedSum;

		StringBuilder sb = new StringBuilder();
		sb.append("안녕하세요 ").append(empNm).append("님\n\n");
		sb.append(payYm).append(" 급여명세서 안내드립니다.\n");
		sb.append("- 부서: ").append(nvl(d.getDeptNm(), "")).append("\n");
		sb.append("- 직위: ").append(nvl(d.getPosNm(), "")).append("\n\n");

		sb.append("[지급]\n");
		sb.append(payLines.length() == 0 ? "- (없음)\n" : payLines.toString());
		sb.append(String.format("지급총액: %,d\n\n", paySum));

		sb.append("[공제]\n");
		sb.append(dedLines.length() == 0 ? "- (없음)\n" : dedLines.toString());
		sb.append(String.format("공제합계: %,d\n\n", dedSum));

		sb.append(String.format("실지급액: %,d\n\n", net));
		sb.append("문의사항은 인사팀으로 연락 바랍니다.\n");
		return new EmailPreviewDTO(subject, sb.toString());
	}

	// ===== 계산 로직 =====

	private PayrollCalcResult calculateForEmployee(String empNo, String payYyyymm) {
		EmployeeInfoDTO emp = payrollMapper.selectEmpInfo(empNo);

		// 1) 기준급: 개인(EMP_PAY_INFO) 우선, 없으면 직위별(GRADE_BASE_AMT)
		EmpPayInfoDTO empPay = payrollMapper.selectCurrentEmpBase(empNo);
		Long base = (empPay != null && empPay.getBaseAmt() != null) ? empPay.getBaseAmt() : null;

		if (base == null && emp != null && !isBlank(emp.getPosCd())) {
			GradeBaseAmtDTO posBase = payrollMapper.selectPosBaseAmt(emp.getPosCd());
			base = (posBase != null && posBase.getStdAmt() != null) ? posBase.getStdAmt() : 0L;
		}
		if (base == null)
			base = 0L;

		// 2) 호봉(가산율) 적용
		// NOTE:
		// - 기존 로직은 EmpPayInfoDTO.getPrvCarrMon() (이전 경력개월) 기반으로 salaryStep을 계산했으나,
		//   현재 프로젝트의 EmpPayInfoDTO / EMP_PAY_INFO 스키마에는 prvCarrMon 필드가 없습니다.
		// - 우선은 EmpPayInfoDTO.salaryGrade 값을 step(호봉)로 간주해 가산율을 적용합니다.
		// - 추후 DB 컬럼/정책이 확정되면 prvCarrMon 등으로 교체하면 됩니다.
		int step = (empPay != null && empPay.getSalaryGrade() != null) ? empPay.getSalaryGrade() : 0;
		step = Math.max(0, step);
		double incPct = 0.0;
		List<StepRateDTO> stepRates = payrollMapper.selectStepRates();
		if (stepRates != null) {
			for (StepRateDTO r : stepRates) {
				if (!"Y".equalsIgnoreCase(nvl(r.getUseYn(), "")))
					continue;
				if (r.getSalaryStep() != null && r.getSalaryStep() == step) {
					incPct = r.getIncreaseRate() == null ? 0.0 : r.getIncreaseRate();
					break;
				}
			}
		}
		long baseAfterStep = Math.round(base * (1.0 + (incPct / 100.0)));

		// 3) 지급 항목(기준급 + 수당)
		Map<String, SalaryItemDTO> salaryItemMap = new HashMap<>();
		List<SalaryItemDTO> defs = payrollMapper.selectAllowanceDefs();
		if (defs != null) {
			for (SalaryItemDTO d : defs) {
				salaryItemMap.put(d.getSalaryItemCode(), d);
			}
		}

		PayrollCalcResult res = new PayrollCalcResult();
		res.items.add(item("BASE", "기준급", "PAY", baseAfterStep, "Y"));

		long paySum = baseAfterStep;

		List<EmpSalaryItemDTO> empItems = payrollMapper.selectCurrentEmpAllowances(empNo);
		if (empItems != null) {
			for (EmpSalaryItemDTO i : empItems) {
				SalaryItemDTO def = salaryItemMap.get(i.getSalaryItemCode());
				String name = def != null ? def.getSalaryItemName() : i.getSalaryItemCode();
				// 수당정의(SALARY_ITEM.item_type)가 '지급/공제'로 저장되어도
				// PAYROLL_ITEM에는 표준 코드(PAY/DEDUCT)를 저장하도록 정규화
				String typeCd = normalizePayrollItemType(def != null ? def.getItemType() : "PAY");
				String taxable = (def != null && "N".equalsIgnoreCase(def.getTaxType())) ? "N" : "Y";
				long amt = i.getItemAmount() == null ? 0L : i.getItemAmount();
				res.items.add(item(i.getSalaryItemCode(), name, typeCd, amt, taxable));
				if ("PAY".equalsIgnoreCase(typeCd)) {
					paySum += amt;
				}
			}
		}

		// 4) 공제(보험/세율)
		InsuranceRateDTO rate = payrollMapper.selectDeductionRates();
		long deductSum = 0L;
		if (rate != null) {
			// ✅ 과세대상 급여 = 지급(PAY) 중 taxableYn=Y 항목 합계
			// 식대/유류비 등 비과세 항목(taxableYn=N)은 소득세/지방소득세 산정기준에서 제외
			long taxablePaySum = res.items.stream()
					.filter(it -> "PAY".equalsIgnoreCase(nvl(it.getItemTypeCd(), "")))
					.filter(it -> !"N".equalsIgnoreCase(nvl(it.getTaxableYn(), "Y")))
					.mapToLong(PayrollItemDTO::getAmount)
					.sum();

			// 보험료는 정책에 따라 기준이 다를 수 있어(보수월액 등) 현재는 총지급(paySum) 기준을 유지
			long pensionAmt = addRateDeduct(res, "PENSION", "국민연금", paySum, rate.getPensionRate());
			long healthAmt = addRateDeduct(res, "HEALTH", "건강보험", paySum, rate.getHealthRate());
			long employAmt = addRateDeduct(res, "EMPLOY", "고용보험", paySum, rate.getEmployRate());

			// ✅ 장기요양보험료는 "건강보험료"를 기준으로 요율을 적용
			long careAmt = addRateDeduct(res, "CARE", "장기요양", healthAmt, rate.getCareRate());

			deductSum += pensionAmt + healthAmt + employAmt + careAmt;

			// ✅ 세금은 과세대상 급여 기준
			long incomeTaxAmt = addRateDeduct(res, "INCOME_TAX", "소득세", taxablePaySum, rate.getIncomeTaxRate());
			// ✅ 지방소득세 = 소득세의 10%
			long localTaxAmt = addLocalIncomeTax(res, incomeTaxAmt);

			deductSum += incomeTaxAmt + localTaxAmt;
		}

		long net = paySum - deductSum;
		res.items.add(item("NET", "실수령액", "TOTAL", net, "Y"));

		res.totalPayAmt = paySum;
		res.totalDeductAmt = deductSum;
		res.netPayAmt = net;
		return res;
	}

	private long addRateDeduct(PayrollCalcResult res, String code, String name, long base, Double pct) {
		double p = pct == null ? 0.0 : pct;
		long amt = Math.round(base * (p / 100.0));
		if (amt != 0) {
			// 공제는 비과세/과세 여부를 표시하는 개념이 아니므로 taxableYn은 Y로 둔다
			res.items.add(item(code, name, "DEDUCT", amt, "Y"));
		}
		return amt;
	}

	/**
	 * ✅ 지방소득세 = 소득세의 10%
	 * - 한국 급여명세서 관행에 맞춰 소득세 금액을 기준으로 산정
	 */
	private long addLocalIncomeTax(PayrollCalcResult res, long incomeTaxAmt) {
		long localTaxAmt = Math.round(incomeTaxAmt * 0.10);
		if (localTaxAmt != 0) {
			res.items.add(item("LOCAL_TAX", "지방소득세", "DEDUCT", localTaxAmt, "Y"));
		}
		return localTaxAmt;
	}

	private PayrollItemDTO item(String code, String name, String typeCd, long amount, String taxableYn) {
		PayrollItemDTO dto = new PayrollItemDTO();
		dto.setItemCode(code);
		dto.setItemName(name);
		dto.setItemTypeCd(typeCd);
		dto.setAmount(amount);
		dto.setTaxableYn(taxableYn);
		return dto;
	}

	private void rebuildTotals(Long payrollNo) {
		List<PayrollItemDTO> items = payrollMapper.selectPayrollItems(payrollNo);
		if (items == null)
			return;
		long pay = items.stream()
				.filter(i -> !"DEDUCT".equalsIgnoreCase(nvl(i.getItemTypeCd(), ""))
						&& !"TOTAL".equalsIgnoreCase(nvl(i.getItemTypeCd(), "")))
				.map(PayrollItemDTO::getAmount).filter(Objects::nonNull).reduce(0L, Long::sum);
		long deduct = items.stream().filter(i -> "DEDUCT".equalsIgnoreCase(nvl(i.getItemTypeCd(), "")))
				.map(PayrollItemDTO::getAmount).filter(Objects::nonNull).reduce(0L, Long::sum);
		long net = pay - deduct;
		payrollMapper.updatePayrollTotals(payrollNo, pay, deduct, net);
	}

	/**
	 * 지급/공제 구분값 정규화
	 * - 프론트/기존 데이터에서 '지급/공제'가 들어오는 경우 PAY/DEDUCT로 변환
	 */
	private String normalizePayrollItemType(String raw) {
		if (raw == null)
			return "PAY";
		String s = raw.trim();
		String u = s.toUpperCase();
		if ("PAY".equals(u) || "지급".equals(s))
			return "PAY";
		if ("DEDUCT".equals(u) || "공제".equals(s))
			return "DEDUCT";
		if ("TOTAL".equals(u) || "합계".equals(s))
			return "TOTAL";
		// 알 수 없는 값은 PAY로 간주(지급 항목이 더 안전)
		return "PAY";
	}

	private boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}

	private String trimToNull(String value) {
		if (value == null) return null;
		String trimmed = value.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private String nvl(String s, String def) {
		return (s == null) ? def : s;
	}

	private static class PayrollCalcResult {
		long totalPayAmt;
		long totalDeductAmt;
		long netPayAmt;
		java.util.ArrayList<PayrollItemDTO> items = new java.util.ArrayList<>();
	}
}