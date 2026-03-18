package com.flowenect.hr.payroll.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.flowenect.hr.dto.payroll.*;
import com.flowenect.hr.payroll.service.PayrollService;

import lombok.RequiredArgsConstructor;

/**
 * React 급여 모듈 API - /api/payroll 하위
 */
@RestController
@RequestMapping("/api/payroll")
@RequiredArgsConstructor
public class PayrollApiController {

	private final PayrollService payrollService;

	// ===== 관리(마스터/사원별) =====

	@GetMapping("/employees")
	public ResponseEntity<List<EmployeePayrollRowDTO>> employees() {
		return ResponseEntity.ok(payrollService.getEmployeeRows());
	}

	@GetMapping("/positions")
	public ResponseEntity<List<PositionDTO>> positions() {
		return ResponseEntity.ok(payrollService.getPositions());
	}

	@GetMapping("/emp-base/{empNo}")
	public ResponseEntity<EmpPayInfoDTO> empBase(@PathVariable String empNo) {
		// 없으면 빈 DTO 반환
		return ResponseEntity.ok(payrollService.getCurrentEmpPayInfo(empNo));
	}

	@GetMapping("/emp-base/{empNo}/history")
	public ResponseEntity<List<EmpPayInfoDTO>> empBaseHistory(@PathVariable String empNo) {
		return ResponseEntity.ok(payrollService.getEmpPayInfoHistory(empNo));
	}

	@PostMapping("/emp-base/{empNo}")
	public ResponseEntity<Map<String, Object>> saveEmpBase(@PathVariable String empNo,
			@RequestBody EmpPayInfoDTO body) {
		payrollService.saveEmpPayInfo(empNo, body);
		return ResponseEntity.ok(Map.of("ok", true));
	}

	@GetMapping("/emp-allowances/{empNo}")
	public ResponseEntity<List<EmpSalaryItemDTO>> empAllowances(@PathVariable String empNo) {
		return ResponseEntity.ok(payrollService.getCurrentEmpSalaryItems(empNo));
	}

	@PostMapping("/emp-allowances/{empNo}")
	public ResponseEntity<Map<String, Object>> saveEmpAllowances(@PathVariable String empNo,
			@RequestBody EmpAllowanceSaveReq req) {
		payrollService.replaceEmpSalaryItems(empNo, req.getAllowances());
		return ResponseEntity.ok(Map.of("ok", true));
	}

	@GetMapping("/pos-base-amt")
	public ResponseEntity<GradeBaseAmtDTO> posBaseAmt(@RequestParam String posCd) {
		return ResponseEntity.ok(payrollService.getGradeBaseAmt(posCd));
	}

	@GetMapping("/pos-base-amt/{posCd}/history")
	public ResponseEntity<List<GradeBaseAmtDTO>> posBaseAmtHistory(@PathVariable String posCd) {
		return ResponseEntity.ok(payrollService.getGradeBaseAmtHistory(posCd));
	}

	/**
	 * 직위별 기준금액 전체 목록(그리드용) 프론트(fetchMasters) 호환: /api/payroll/pos-base-amt/list
	 */
	@GetMapping("/pos-base-amt/list")
	public ResponseEntity<List<GradeBaseAmtDTO>> posBaseAmtList() {
		return ResponseEntity.ok(payrollService.getGradeBaseAmtList());
	}

	@PostMapping("/pos-base-amt")
	public ResponseEntity<Map<String, Object>> savePosBaseAmt(@RequestBody GradeBaseAmtDTO body) {
		payrollService.saveGradeBaseAmt(body);
		return ResponseEntity.ok(Map.of("ok", true));
	}

	@GetMapping("/step-rates")
	public ResponseEntity<List<StepRateDTO>> stepRates() {
		return ResponseEntity.ok(payrollService.getStepRates());
	}

	@PostMapping("/step-rates")
	public ResponseEntity<Map<String, Object>> saveStepRates(@RequestBody StepRateSaveReq req) {
		payrollService.replaceStepRates(req.getItems());
		return ResponseEntity.ok(Map.of("ok", true));
	}

	@GetMapping("/allowance-def")
	public ResponseEntity<List<SalaryItemDTO>> allowanceDefs() {
		return ResponseEntity.ok(payrollService.getSalaryItems());
	}

	@PostMapping("/allowance-def")
	public ResponseEntity<Map<String, Object>> upsertAllowanceDef(@RequestBody SalaryItemDTO body) {
		SalaryItemDTO saved = payrollService.upsertSalaryItem(body);
		return ResponseEntity
				.ok(Map.of("ok", true, "salaryItemCode", saved != null ? saved.getSalaryItemCode() : null));
	}

	@GetMapping("/deduction-rate")
	public ResponseEntity<List<InsuranceRateDTO>> deductionRates() {
		return ResponseEntity.ok(payrollService.getInsuranceRates());
	}

	@PostMapping("/deduction-rate")
	public ResponseEntity<Map<String, Object>> upsertDeductionRate(@RequestBody InsuranceRateDTO body) {
		payrollService.upsertInsuranceRate(body);
		return ResponseEntity.ok(Map.of("ok", true));
	}

	// ===== 명세서 =====

	@GetMapping("/statements")
	public ResponseEntity<List<PayrollListRowDTO>> statements(
			@RequestParam(required = false) String payYm,
			@RequestParam(required = false) String fromYm,
			@RequestParam(required = false) String toYm) {
		String baseYm = (payYm != null && !payYm.isBlank()) ? payYm : null;
		String startYm = baseYm != null ? baseYm : fromYm;
		String endYm = baseYm != null ? baseYm : toYm;
		if (startYm == null || startYm.isBlank() || endYm == null || endYm.isBlank()) {
			return ResponseEntity.badRequest().build();
		}
		return ResponseEntity.ok(payrollService.getPayrollList(startYm, endYm));
	}

	@PostMapping("/statements/generate")
	public ResponseEntity<Map<String, Object>> generate(@RequestParam String payYm) {
		// payYm 파라미터는 기존 프론트와 호환을 위해 유지, 내부는 PAY_YYYYMM으로 사용
		payrollService.generateStatements(payYm);
		return ResponseEntity.ok(Map.of("ok", true));
	}

	@GetMapping("/statements/{payrollId}")
	public ResponseEntity<PayrollDetailDTO> statementDetail(@PathVariable Long payrollId) {
		return ResponseEntity.ok(payrollService.getPayrollDetail(payrollId));
	}

	@PutMapping("/statements/{payrollId}")
	public ResponseEntity<Map<String, Object>> updateDetail(@PathVariable Long payrollId,
			@RequestBody PayrollUpdateReq req) {
		try {
			payrollService.updatePayrollDetail(payrollId, req.getItems());
			return ResponseEntity.ok(Map.of("ok", true));
		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("ok", false, "message", e.getMessage()));
		}
	}

	@PostMapping("/statements/confirm")
	public ResponseEntity<Map<String, Object>> confirm(@RequestBody PayrollConfirmReq req) {
		payrollService.confirmStatements(req.getPayrollIds());
		return ResponseEntity.ok(Map.of("ok", true));
	}

	@DeleteMapping("/statements")
	public ResponseEntity<Map<String, Object>> delete(@RequestBody PayrollDeleteReq req) {
		try {
			payrollService.deleteStatements(req.getPayrollIds());
			return ResponseEntity.ok(Map.of("ok", true));
		} catch (IllegalStateException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("ok", false, "message", e.getMessage()));
		}
	}

	@GetMapping("/statements/{payrollId}/email-preview")
	public ResponseEntity<Map<String, String>> emailPreview(@PathVariable Long payrollId) {
		Map<String, String> m = new HashMap<>();
		EmailPreviewDTO dto = payrollService.getEmailPreview(payrollId);
		m.put("subject", dto.getSubject());
		m.put("body", dto.getBody());
		return ResponseEntity.ok(m);
	}

	
	@GetMapping(value = "/statements/{payrollId}/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	public ResponseEntity<byte[]> statementExcel(@PathVariable Long payrollId) {
		byte[] xlsx = payrollService.getPayrollExcel(payrollId);
		String filename = "payroll_" + payrollId + ".xlsx";
		return ResponseEntity.ok()
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
				.body(xlsx);
	}

	@GetMapping(value = "/statements/{payrollId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
	public ResponseEntity<byte[]> statementPdf(@PathVariable Long payrollId) {
		byte[] pdf = payrollService.getPayrollPdf(payrollId);
		String filename = "payroll_" + payrollId + ".pdf";
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
				.contentType(MediaType.APPLICATION_PDF).body(pdf);
	}
}
