package com.flowenect.hr.payroll.service;

import java.util.List;

import com.flowenect.hr.dto.payroll.*;

public interface PayrollService {

  // ===== 관리(마스터/사원별) =====
  List<EmployeePayrollRowDTO> getEmployeeRows();
  List<PositionDTO> getPositions();
  EmpPayInfoDTO getCurrentEmpPayInfo(String empNo);
  List<EmpPayInfoDTO> getEmpPayInfoHistory(String empNo);
  void saveEmpPayInfo(String empNo, EmpPayInfoDTO body);

  List<EmpSalaryItemDTO> getCurrentEmpSalaryItems(String empNo);
  void replaceEmpSalaryItems(String empNo, List<EmpSalaryItemDTO> items);

  GradeBaseAmtDTO getGradeBaseAmt(String posCd);
  /** 직위별 기준금액 전체 목록(그리드용) */
  List<GradeBaseAmtDTO> getGradeBaseAmtList();
  /** 직위별 기준금액 이력(해당 직위) */
  List<GradeBaseAmtDTO> getGradeBaseAmtHistory(String posCd);
  void saveGradeBaseAmt(GradeBaseAmtDTO dto);

  List<StepRateDTO> getStepRates();
  void replaceStepRates(List<StepRateDTO> items);

  List<SalaryItemDTO> getSalaryItems();
  /**
   * 수당정의 저장
   * - salaryItemCode가 있으면 수정
   * - 없으면 신규(코드 자동 생성)
   */
  SalaryItemDTO upsertSalaryItem(SalaryItemDTO dto);

  // 공제율 리스트(그리드용)
  List<InsuranceRateDTO> getInsuranceRates();
  // 기존 단건(내부 계산/호환)
  InsuranceRateDTO getCurrentInsuranceRate();
  void upsertInsuranceRate(InsuranceRateDTO dto);

  // ===== 명세서 =====
  List<PayrollListRowDTO> getPayrollList(String fromYm, String toYm);
  void generateStatements(String payYyyymm);
  PayrollDetailDTO getPayrollDetail(Long payrollNo);
  void updatePayrollDetail(Long payrollNo, List<PayrollItemDTO> items);
  void confirmStatements(List<Long> payrollNos);
  void deleteStatements(List<Long> payrollNos);

  EmailPreviewDTO getEmailPreview(Long payrollNo);

  /** 급여명세서 PDF 바이너리 반환 */
  byte[] getPayrollPdf(Long payrollNo);

  /** 급여명세서 Excel(xlsx) 바이너리 반환 */
  byte[] getPayrollExcel(Long payrollNo);
}
