package com.flowenect.hr.history.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.flowenect.hr.dto.common.HistoryPageDTO;
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
import com.flowenect.hr.history.mapper.HistoryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoryServiceImpl implements HistoryService {

    private static final Set<String> PAY_TABS = Set.of(
        "EMP_BASE",
        "EMP_ALLOW",
        "POS_BASE",
        "STEP_SET",
        "INSURANCE",
        "PAYROLL"
    );

    private static final Set<String> APRV_STAT_CODES = Set.of(
        "SUBMITTED",
        "IN_PROGRESS",
        "APPROVED",
        "REJECTED",
        "CANCELED",
        "DRAFT"
    );

    private final HistoryMapper historyMapper;

    private PayHistorySearchDTO safePay(PayHistorySearchDTO s) {
        if (s == null) s = new PayHistorySearchDTO();
        if (s.getPage() <= 0) s.setPage(1);
        if (s.getSize() <= 0) s.setSize(10);
        if (s.getSize() > 100) s.setSize(100);

        String tab = s.getTab();
        if (tab == null || tab.isBlank()) {
            s.setTab("EMP_BASE");
        } else {
            String normalized = tab.trim().toUpperCase();
            s.setTab(PAY_TABS.contains(normalized) ? normalized : "EMP_BASE");
        }

        if (s.getPayMonthFrom() != null) {
            s.setPayMonthFrom(s.getPayMonthFrom().replaceAll("[^0-9]", ""));
        }
        if (s.getPayMonthTo() != null) {
            s.setPayMonthTo(s.getPayMonthTo().replaceAll("[^0-9]", ""));
        }

        if ((s.getPayMonthFrom() == null || s.getPayMonthFrom().isBlank()) && s.getPayMonthTo() != null && !s.getPayMonthTo().isBlank()) {
            s.setPayMonthFrom(s.getPayMonthTo());
        }
        if ((s.getPayMonthTo() == null || s.getPayMonthTo().isBlank()) && s.getPayMonthFrom() != null && !s.getPayMonthFrom().isBlank()) {
            s.setPayMonthTo(s.getPayMonthFrom());
        }

        return s;
    }

    private void normalizePageAndDate(ApntHistSearchDTO s) {
        if (s.getPage() <= 0) s.setPage(1);
        if (s.getSize() <= 0) s.setSize(10);
        if (s.getSize() > 100) s.setSize(100);
        applyDefaultOneMonthRange(s.getStartDate(), s.getEndDate(), s::setStartDate, s::setEndDate);
        s.setEmpNm(trimToNull(s.getEmpNm()));
        s.setProcEmpNm(trimToNull(s.getProcEmpNm()));
        s.setBfDeptNm(trimToNull(s.getBfDeptNm()));
        s.setAfDeptNm(trimToNull(s.getAfDeptNm()));
        s.setApntRsn(trimToNull(s.getApntRsn()));
    }

    private void normalizePageAndDate(PromotionHistSearchDTO s) {
        if (s.getPage() <= 0) s.setPage(1);
        if (s.getSize() <= 0) s.setSize(10);
        if (s.getSize() > 100) s.setSize(100);
        applyDefaultOneMonthRange(s.getStartDate(), s.getEndDate(), s::setStartDate, s::setEndDate);
        s.setEmpNm(trimToNull(s.getEmpNm()));
        s.setProcEmpNm(trimToNull(s.getProcEmpNm()));
        s.setBfPosNm(trimToNull(s.getBfPosNm()));
        s.setAfPosNm(trimToNull(s.getAfPosNm()));
        s.setPromoRsn(trimToNull(s.getPromoRsn()));
    }

    private void normalizePageAndDate(AprvHistSearchDTO s) {
        if (s.getPage() <= 0) s.setPage(1);
        if (s.getSize() <= 0) s.setSize(10);
        if (s.getSize() > 100) s.setSize(100);
        applyDefaultOneMonthRange(s.getStartDate(), s.getEndDate(), s::setStartDate, s::setEndDate);
        s.setFormCd(normalizeAllValue(s.getFormCd()));
        s.setEmpNm(trimToNull(s.getEmpNm()));
        s.setAprvTtl(trimToNull(s.getAprvTtl()));
        s.setStatCd(normalizeAprvStatCd(s.getStatCd()));
    }

    private void applyDefaultOneMonthRange(String startDate, String endDate,
                                           java.util.function.Consumer<String> startSetter,
                                           java.util.function.Consumer<String> endSetter) {
        String start = trimToNull(startDate);
        String end = trimToNull(endDate);
        LocalDate today = LocalDate.now();

        if (start == null && end == null) {
            startSetter.accept(today.minusMonths(1).toString());
            endSetter.accept(today.toString());
            return;
        }
        if (start == null) {
            startSetter.accept(end);
            endSetter.accept(end);
            return;
        }
        if (end == null) {
            startSetter.accept(start);
            endSetter.accept(start);
            return;
        }
        if (start.compareTo(end) > 0) {
            startSetter.accept(end);
            endSetter.accept(start);
            return;
        }
        startSetter.accept(start);
        endSetter.accept(end);
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String normalizeAllValue(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null || "ALL".equalsIgnoreCase(trimmed)) {
            return null;
        }
        return trimmed;
    }

    private String normalizeAprvStatCd(String value) {
        String normalized = normalizeAllValue(value);
        if (normalized == null) {
            return null;
        }
        String upper = normalized.toUpperCase();
        return APRV_STAT_CODES.contains(upper) ? upper : null;
    }

    @Override
    public PagedResponseV2<PayHistDTO> readPayHistList(PayHistorySearchDTO search) {
        PayHistorySearchDTO s = safePay(search);
        int total = historyMapper.selectPayHistCount(s);
        HistoryPageDTO paging = HistoryPageDTO.of(s.getPage(), s.getSize(), total);
        List<PayHistDTO> list = (total == 0) ? Collections.emptyList() : historyMapper.selectPayHistList(s);
        return PagedResponseV2.of(list, paging);
    }

    @Override
    public List<StepRateDTO> readPayStepSetDetail(String startDate) {
        if (startDate == null || startDate.isBlank()) {
            return Collections.emptyList();
        }
        return historyMapper.selectPayStepSetDetail(startDate);
    }

    @Override
    public PagedResponseV2<ApntHistDTO> readApntHistList(ApntHistSearchDTO search) {
        ApntHistSearchDTO s = search == null ? new ApntHistSearchDTO() : search;
        normalizePageAndDate(s);
        int total = historyMapper.selectApntHistCount(s);
        HistoryPageDTO paging = HistoryPageDTO.of(s.getPage(), s.getSize(), total);
        List<ApntHistDTO> list = (total == 0) ? Collections.emptyList() : historyMapper.selectApntHistList(s);
        return PagedResponseV2.of(list, paging);
    }

    @Override
    public PagedResponseV2<PromotionHistDTO> readPromotionHistList(PromotionHistSearchDTO search) {
        PromotionHistSearchDTO s = search == null ? new PromotionHistSearchDTO() : search;
        normalizePageAndDate(s);
        int total = historyMapper.selectPromotionHistCount(s);
        HistoryPageDTO paging = HistoryPageDTO.of(s.getPage(), s.getSize(), total);
        List<PromotionHistDTO> list = (total == 0) ? Collections.emptyList() : historyMapper.selectPromotionHistList(s);
        return PagedResponseV2.of(list, paging);
    }

    @Override
    public PagedResponseV2<AprvHistDTO> readAprvHistList(AprvHistSearchDTO search) {
        AprvHistSearchDTO s = search == null ? new AprvHistSearchDTO() : search;
        normalizePageAndDate(s);
        int total = historyMapper.selectAprvHistCount(s);
        HistoryPageDTO paging = HistoryPageDTO.of(s.getPage(), s.getSize(), total);
        List<AprvHistDTO> list = (total == 0) ? Collections.emptyList() : historyMapper.selectAprvHistList(s);
        return PagedResponseV2.of(list, paging);
    }

    @Override
    public AprvHistDetailDTO readAprvHistDetail(Long aprvNo) {
        if (aprvNo == null) {
            return null;
        }
        return historyMapper.selectAprvHistDetail(aprvNo);
    }

    @Override
    public byte[] downloadApntHistExcel(ApntHistSearchDTO search) {
        ApntHistSearchDTO s = search == null ? new ApntHistSearchDTO() : search;
        normalizePageAndDate(s);
        int total = historyMapper.selectApntHistCount(s);
        if (total <= 0) {
            return ApntHistExcelWriter.write(List.of());
        }
        s.setPage(1);
        s.setSize(total);
        return ApntHistExcelWriter.write(historyMapper.selectApntHistList(s));
    }

    @Override
    public byte[] downloadPromotionHistExcel(PromotionHistSearchDTO search) {
        PromotionHistSearchDTO s = search == null ? new PromotionHistSearchDTO() : search;
        normalizePageAndDate(s);
        int total = historyMapper.selectPromotionHistCount(s);
        if (total <= 0) {
            return PromotionHistExcelWriter.write(List.of());
        }
        s.setPage(1);
        s.setSize(total);
        return PromotionHistExcelWriter.write(historyMapper.selectPromotionHistList(s));
    }

    @Override
    public byte[] downloadAprvHistExcel(AprvHistSearchDTO search) {
        AprvHistSearchDTO s = search == null ? new AprvHistSearchDTO() : search;
        normalizePageAndDate(s);
        int total = historyMapper.selectAprvHistCount(s);
        if (total <= 0) {
            return AprvHistExcelWriter.write(List.of());
        }
        s.setPage(1);
        s.setSize(total);
        return AprvHistExcelWriter.write(historyMapper.selectAprvHistExcelList(s));
    }

    @Override
    public List<CodeNameDTO> readAprvFormTypes() {
        return historyMapper.selectAprvFormTypes();
    }

    @Override
    public List<CodeNameDTO> readAprvStatTypes() {
        return historyMapper.selectAprvStatTypes();
    }
}
