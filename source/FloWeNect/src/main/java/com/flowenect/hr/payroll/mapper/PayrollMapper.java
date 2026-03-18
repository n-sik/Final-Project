package com.flowenect.hr.payroll.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.payroll.*;

@Mapper
public interface PayrollMapper {

  List<EmployeePayrollRowDTO> selectEmployeePayrollRows();

  
	List<EmployeePayrollRowDTO> selectEmployeesForPayrollGeneration(@org.apache.ibatis.annotations.Param("baseDate") java.util.Date baseDate);
List<PositionDTO> selectPositions();

  EmployeeInfoDTO selectEmpInfo(@Param("empNo") String empNo);

  EmpPayInfoDTO selectCurrentEmpBase(@Param("empNo") String empNo);

  /** END_DTM=9999-12-31 인 '현재 열려있는' 기준금 row(있으면 1건) */
  EmpPayInfoDTO selectOpenEmpBase(@Param("empNo") String empNo);

  /** 개인 기준금액 이력 전체 */
  List<EmpPayInfoDTO> selectEmpBaseHistory(@Param("empNo") String empNo);

  int mergeEmpBase(EmpPayInfoDTO dto);

  /** 기존 현재행 종료 처리(END_DTM 갱신) */
  int updateEmpBaseEndDtm(@Param("paySeq") Long paySeq, @Param("endDtm") String endDtm);

  List<EmpSalaryItemDTO> selectCurrentEmpAllowances(@Param("empNo") String empNo);

  int deleteEmpAllowances(@Param("empNo") String empNo);

  int insertEmpAllowance(EmpSalaryItemDTO dto);

  GradeBaseAmtDTO selectPosBaseAmt(@Param("posCd") String posCd);
  GradeBaseAmtDTO selectOpenPosBaseAmt(@Param("posCd") String posCd);


  // 그리드용 목록
  List<GradeBaseAmtDTO> selectPosBaseAmtList();
  List<GradeBaseAmtDTO> selectPosBaseAmtHistory(@Param("posCd") String posCd);


  int mergePosBaseAmt(GradeBaseAmtDTO dto);
  int updatePosBaseAmtEndDtm(@Param("baseAmtNo") Long baseAmtNo, @Param("endDtm") String endDtm);


  List<StepRateDTO> selectStepRates();
  String selectOpenStepSetStartDtm();


  int deleteStepRates();
  int deleteStepRatesByStartDtm(@Param("startDtm") String startDtm);

  int updateOpenStepSetEndDtm(@Param("endDtm") String endDtm);


  int insertStepRate(StepRateDTO dto);

  List<SalaryItemDTO> selectAllowanceDefs();

  /** 신규 코드 채번(수당코드: SEQ_ITEM_NO 기반) */
  String nextSalaryItemCode();

  /** 신규 등록(코드 자동 생성) */
  int insertAllowanceDef(SalaryItemDTO dto);

  /** 수정 */
  int updateAllowanceDef(SalaryItemDTO dto);

  /** (호환) 예전 upsert 방식 */
  int mergeAllowanceDef(SalaryItemDTO dto);

  // 현재 적용 1건(계산/호환)
  InsuranceRateDTO selectDeductionRates();
  InsuranceRateDTO selectOpenDeductionRate();


  // 그리드용 목록
  List<InsuranceRateDTO> selectDeductionRatesList();
  int updateDeductionRateEndDtm(@Param("rateNo") Long rateNo, @Param("endDtm") String endDtm);


  int mergeDeductionRate(InsuranceRateDTO dto);

  // ===== statements =====
  List<PayrollListRowDTO> selectPayrollList(@Param("fromYm") String fromYm, @Param("toYm") String toYm);

  int selectPayrollExists(@Param("empNo") String empNo, @Param("payYyyymm") String payYyyymm);

  int insertPayroll(PayrollHeaderDTO dto);

  int deletePayrollItems(@Param("payrollNo") Long payrollNo);

  int insertPayrollItem(PayrollItemDTO dto);

  PayrollHeaderDTO selectPayrollHeader(@Param("payrollNo") Long payrollNo);

  List<PayrollItemDTO> selectPayrollItems(@Param("payrollNo") Long payrollNo);

  int updatePayrollItemAmount(@Param("itemDetailNo") Long itemDetailNo, @Param("amount") Long amount);

  int updatePayrollConfirmYn(@Param("payrollNo") Long payrollNo, @Param("confirmYn") String confirmYn);

  int updatePayrollTotals(@Param("payrollNo") Long payrollNo,
                          @Param("totalPayAmt") Long totalPayAmt,
                          @Param("totalDeductAmt") Long totalDeductAmt,
                          @Param("netPayAmt") Long netPayAmt);

  int deletePayrolls(@Param("payrollIds") List<Long> payrollIds);
}
