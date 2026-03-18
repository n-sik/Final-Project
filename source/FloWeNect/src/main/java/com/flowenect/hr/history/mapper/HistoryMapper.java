package com.flowenect.hr.history.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.history.ApntHistDTO;
import com.flowenect.hr.dto.history.ApntHistSearchDTO;
import com.flowenect.hr.dto.history.AprvHistDTO;
import com.flowenect.hr.dto.history.AprvHistDetailDTO;
import com.flowenect.hr.dto.history.AprvHistSearchDTO;
import com.flowenect.hr.dto.history.CodeNameDTO;
import com.flowenect.hr.dto.history.PayHistDTO;
import com.flowenect.hr.dto.history.PayHistorySearchDTO;
import com.flowenect.hr.dto.history.PromotionHistDTO;
import com.flowenect.hr.dto.history.PromotionHistSearchDTO;
import com.flowenect.hr.dto.payroll.StepRateDTO;

@Mapper
public interface HistoryMapper {

    // 1) 급여관리이력
    List<PayHistDTO> selectPayHistList(PayHistorySearchDTO search);
    int selectPayHistCount(PayHistorySearchDTO search);
    List<StepRateDTO> selectPayStepSetDetail(@Param("startDate") String startDate);

    // 2) 인사발령이력
    List<ApntHistDTO> selectApntHistList(ApntHistSearchDTO search);
    int selectApntHistCount(ApntHistSearchDTO search);

    // 3) 승진이력
    List<PromotionHistDTO> selectPromotionHistList(PromotionHistSearchDTO search);
    int selectPromotionHistCount(PromotionHistSearchDTO search);

    // 4) 전자결재이력
    List<AprvHistDTO> selectAprvHistList(AprvHistSearchDTO search);
    int selectAprvHistCount(AprvHistSearchDTO search);
    AprvHistDetailDTO selectAprvHistDetail(@Param("aprvNo") Long aprvNo);
    List<AprvHistDetailDTO> selectAprvHistExcelList(AprvHistSearchDTO search);

    // 보조: 전자결재 옵션
    List<CodeNameDTO> selectAprvFormTypes();
    List<CodeNameDTO> selectAprvStatTypes();
}
