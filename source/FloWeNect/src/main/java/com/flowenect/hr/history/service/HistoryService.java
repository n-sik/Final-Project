package com.flowenect.hr.history.service;

import java.util.List;

import com.flowenect.hr.dto.common.PagedResponseV2;
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

public interface HistoryService {

    PagedResponseV2<PayHistDTO> readPayHistList(PayHistorySearchDTO search);

    List<StepRateDTO> readPayStepSetDetail(String startDate);

    PagedResponseV2<ApntHistDTO> readApntHistList(ApntHistSearchDTO search);

    PagedResponseV2<PromotionHistDTO> readPromotionHistList(PromotionHistSearchDTO search);

    PagedResponseV2<AprvHistDTO> readAprvHistList(AprvHistSearchDTO search);

    AprvHistDetailDTO readAprvHistDetail(Long aprvNo);

    byte[] downloadApntHistExcel(ApntHistSearchDTO search);

    byte[] downloadPromotionHistExcel(PromotionHistSearchDTO search);

    byte[] downloadAprvHistExcel(AprvHistSearchDTO search);

    List<CodeNameDTO> readAprvFormTypes();

    List<CodeNameDTO> readAprvStatTypes();
}
