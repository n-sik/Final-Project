package com.flowenect.hr.history.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
import com.flowenect.hr.history.service.HistoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/history")
public class HistoryController {

    private static final DateTimeFormatter FILE_DTM_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    private final HistoryService historyService;

    // 1) 급여관리이력
    @GetMapping("/pay/list")
    public ResponseEntity<PagedResponseV2<PayHistDTO>> payList(PayHistorySearchDTO search) {
        return ResponseEntity.ok(historyService.readPayHistList(search));
    }

    @GetMapping("/pay/step-set/detail")
    public ResponseEntity<List<StepRateDTO>> payStepSetDetail(@RequestParam String startDate) {
        return ResponseEntity.ok(historyService.readPayStepSetDetail(startDate));
    }

    // 2) 인사발령이력
    @GetMapping("/workforce/apnt/list")
    public ResponseEntity<PagedResponseV2<ApntHistDTO>> apntList(ApntHistSearchDTO search) {
        return ResponseEntity.ok(historyService.readApntHistList(search));
    }

    @GetMapping(value = "/workforce/apnt/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> apntExcel(ApntHistSearchDTO search) {
        return excelResponse(historyService.downloadApntHistExcel(search), "workforce_apnt_history");
    }

    // 3) 승진이력
    @GetMapping("/workforce/promotion/list")
    public ResponseEntity<PagedResponseV2<PromotionHistDTO>> promotionList(PromotionHistSearchDTO search) {
        return ResponseEntity.ok(historyService.readPromotionHistList(search));
    }

    @GetMapping(value = "/workforce/promotion/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> promotionExcel(PromotionHistSearchDTO search) {
        return excelResponse(historyService.downloadPromotionHistExcel(search), "workforce_promotion_history");
    }

    // 4) 전자결재이력
    @GetMapping("/aprv/list")
    public ResponseEntity<PagedResponseV2<AprvHistDTO>> aprvList(AprvHistSearchDTO search) {
        return ResponseEntity.ok(historyService.readAprvHistList(search));
    }

    @GetMapping("/aprv/{aprvNo}")
    public ResponseEntity<AprvHistDetailDTO> aprvDetail(@PathVariable Long aprvNo) {
        AprvHistDetailDTO detail = historyService.readAprvHistDetail(aprvNo);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    @GetMapping(value = "/aprv/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> aprvExcel(AprvHistSearchDTO search) {
        return excelResponse(historyService.downloadAprvHistExcel(search), "approval_history");
    }

    // 전자결재 양식 목록
    @GetMapping("/aprv/forms")
    public ResponseEntity<List<CodeNameDTO>> aprvForms() {
        return ResponseEntity.ok(historyService.readAprvFormTypes());
    }

    @GetMapping("/aprv/statuses")
    public ResponseEntity<List<CodeNameDTO>> aprvStatuses() {
        return ResponseEntity.ok(historyService.readAprvStatTypes());
    }

    private ResponseEntity<byte[]> excelResponse(byte[] body, String filePrefix) {
        String filename = filePrefix + "_" + LocalDateTime.now().format(FILE_DTM_FORMATTER) + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(body);
    }
}
