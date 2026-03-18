package com.flowenect.hr.aprv.service;

import static com.flowenect.hr.aprv.consts.AprvConst.ACT_APPROVE;
import static com.flowenect.hr.aprv.consts.AprvConst.ACT_REJECT;
import static com.flowenect.hr.aprv.consts.AprvConst.CREATE_SUBMIT;
import static com.flowenect.hr.aprv.consts.AprvConst.DOC_DRAFT;
import static com.flowenect.hr.aprv.consts.AprvConst.DOC_IN_PROGRESS;
import static com.flowenect.hr.aprv.consts.AprvConst.DOC_SUBMITTED;
import static com.flowenect.hr.aprv.consts.AprvConst.LINE_WAIT;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.aprv.mapper.AprvMapper;
import com.flowenect.hr.dto.aprv.ApprFileDTO;
import com.flowenect.hr.dto.aprv.AprvAppointmentDTO;
import com.flowenect.hr.dto.aprv.AprvAssetHistDTO;
import com.flowenect.hr.dto.aprv.AprvCodeDTO;
import com.flowenect.hr.dto.aprv.AprvCreateDTO;
import com.flowenect.hr.dto.aprv.AprvDocDTO;
import com.flowenect.hr.dto.aprv.AprvDocListRowDTO;
import com.flowenect.hr.dto.aprv.AprvEmpOptionDTO;
import com.flowenect.hr.dto.aprv.AprvEmpSnapDTO;
import com.flowenect.hr.dto.aprv.AprvFormTypeDTO;
import com.flowenect.hr.dto.aprv.AprvHeadcountDTO;
import com.flowenect.hr.dto.aprv.AprvLeaveDTO;
import com.flowenect.hr.dto.aprv.AprvLineDTO;
import com.flowenect.hr.dto.aprv.AprvLoaDTO;
import com.flowenect.hr.dto.aprv.AprvProcessDTO;
import com.flowenect.hr.dto.aprv.AprvPromotionDTO;
import com.flowenect.hr.dto.aprv.AprvReadDTO;
import com.flowenect.hr.dto.aprv.AprvReadListCondDTO;
import com.flowenect.hr.dto.aprv.AprvRefDTO;
import com.flowenect.hr.dto.aprv.AprvRetireDTO;
import com.flowenect.hr.dto.aprv.PageDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AprvServiceImpl implements AprvService {

    private final AprvMapper aprvMapper;
    private final AprvPdfService aprvPdfService;
    private final AprvAccessService aprvAccessService;


    @Override
    public List<AprvFormTypeDTO> readFormTypes() {
        return aprvMapper.selectAprvFormTypeList();
    }

    @Override
    public List<AprvEmpOptionDTO> readEmpOptions() {
        return aprvMapper.selectAprvEmpOptionList();
    }
    
    @Override
    public List<AprvEmpOptionDTO> readDeptHeadOptions() {
        return aprvMapper.selectDeptHeadEmpOptionList();
    }

    @Override
    public AprvEmpSnapDTO readEmpSnap(String empNo) {
        return aprvMapper.selectEmpSnapByEmpNo(empNo);
    }

    @Override
    public List<AprvCodeDTO> readStatCodes(String statDiv) {
        return aprvMapper.selectAprvStatCdList(statDiv);
    }
    
    @Override
    public List<AprvCodeDTO> readDeptCodes() {
        return aprvMapper.selectDeptCodeList();
    }

    @Override
    public List<AprvCodeDTO> readPosCodes() {
        return aprvMapper.selectPosCodeList();
    }

    @Override
    public Map<String, Object> readList(AprvReadListCondDTO cond, String empNo) {

        // 정책: APRV_NO는 순수 PK(숫자). 사용자 입력도 숫자만 허용.
        cond.setAprvNoNum(parseAprvNoToLong(cond.getAprvNo()));

        // 정책: 기간 기본 1개월 (fromDt/toDt 미입력 시)
        applyDefaultOneMonthRange(cond);


        int totalCount = aprvMapper.selectAprvDocReadListCount(cond, empNo);
        PageDTO page = new PageDTO(cond.getPage(), cond.getSize(), totalCount);

        List<AprvDocListRowDTO> docs = aprvMapper.selectAprvDocReadList(cond, empNo, page.getStartRow(), page.getEndRow());
        List<AprvFormTypeDTO> forms = aprvMapper.selectAprvFormTypeList();

        Map<String, Object> result = new HashMap<>();
        result.put("docs", docs);
        result.put("forms", forms);
        result.put("page", page);

        return result;
    }


    private void applyDefaultOneMonthRange(AprvReadListCondDTO cond) {
        String from = cond.getFromDt();
        String to = cond.getToDt();
        boolean emptyFrom = (from == null || from.trim().isEmpty());
        boolean emptyTo = (to == null || to.trim().isEmpty());

        if (emptyFrom && emptyTo) {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate oneMonthAgo = today.minusMonths(1);
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ISO_LOCAL_DATE;

            cond.setFromDt(oneMonthAgo.format(fmt));
            cond.setToDt(today.format(fmt));
        }
    }

    private Long parseAprvNoToLong(String aprvNo) {
        if (aprvNo == null) {
            return null;
        }
        String trimmed = aprvNo.trim();
        // 숫자만 허용 ("12345")
        if (trimmed.isEmpty() || !trimmed.matches("\\d+")) {
            return null;
        }
        try {
            return Long.parseLong(trimmed);
        } catch (NumberFormatException e) {
            return null;
        }
    }


    // modify

    @Transactional
    @Override
    public void modify(AprvProcessDTO dto, String empNo) {

        long aprvNo = dto.getAprvNo();
        String loginEmpNo = empNo;

        // 문서 상태 확인 (SUBMITTED/IN_PROGRESS에서 결재 가능)
        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        if (doc == null) {
            throw new IllegalStateException("문서를 찾을 수 없습니다.");
        }

        String statCd = doc.getStatCd();
        if (!DOC_SUBMITTED.equals(statCd) && !DOC_IN_PROGRESS.equals(statCd)) {
            throw new IllegalStateException("상신완료(SUBMITTED) 또는 결재중(IN_PROGRESS) 상태에서만 처리할 수 있습니다.");
        }

        // 첫 결재 액션이면 SUBMITTED -> IN_PROGRESS 전환
        if (DOC_SUBMITTED.equals(statCd)) {
            int changed = aprvMapper.updateDocInProgressFromSubmitted(aprvNo);
            if (changed == 0) {
                doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
                if (doc == null || (!DOC_IN_PROGRESS.equals(doc.getStatCd()) && !DOC_SUBMITTED.equals(doc.getStatCd()))) {
                    throw new IllegalStateException("문서 상태를 전환할 수 없습니다.");
                }
            }
        }

        // 1) 내 차례 WAIT 라인 찾기
        AprvLineDTO myLine = aprvMapper.selectCurrentWaitLine(aprvNo, empNo);
        if (myLine == null) {
            throw new IllegalStateException("처리 가능한 결재 대기 라인이 없습니다.");
        }

        if (ACT_APPROVE.equals(dto.getAction())) {

            // 2) assetType 검증
            String assetType = dto.getAssetType();
            if (assetType == null || (!"SIGN".equals(assetType) && !"SEAL".equals(assetType))) {
                throw new IllegalStateException("서명/직인(assetType)을 선택해 주세요.");
            }

            // 3) 로그인 사용자 최신 자산 조회 (없으면 승인 불가 정책)
            var asset = aprvMapper.selectLatestAprvSign(loginEmpNo, assetType);
            if (asset == null || asset.getFilePath() == null || asset.getFilePath().isBlank()) {
                throw new IllegalStateException("선택한 " + assetType + " 자산이 없습니다. 서명/직인을 먼저 등록해 주세요.");
            }

            // 4) 내 라인 승인 처리 (동시성 방지: lineNo+empNo+WAIT)
            int updated = aprvMapper.updateLineApproved(myLine.getLineNo(), loginEmpNo);
            if (updated == 0) {
                throw new IllegalStateException("이미 처리되었거나 처리할 수 없는 결재라인입니다.");
            }

            // 5) 자산 스냅샷 저장 (ASSET_HIST)
            aprvMapper.insertAssetHist(
                    assetType,
                    myLine.getLineNo(),
                    asset.getAssetNo(),
                    asset.getAssetNm(),
                    asset.getFilePath()
            );

            // 6) 마지막 결재자인지 확인
            int remaining = aprvMapper.countRemainingWaitLines(aprvNo);

            if (remaining == 0) {
                int docUpdated = aprvMapper.updateDocApproved(aprvNo);
                if (docUpdated > 0) {
                    // FINAL_PDF는 승인완료 전환 성공 1회에 한해 생성(중복은 PDF 서비스에서 방지)
					try {
						aprvPdfService.generateAndSaveFinalPdf(aprvNo, loginEmpNo);
					} catch (Exception ex) {
						log.warn("FINAL_PDF 생성 실패(승인 후). aprvNo={}, empNo={}", aprvNo, loginEmpNo, ex);
					}
                }
            }

        } else if (ACT_REJECT.equals(dto.getAction())) {

            int updated = aprvMapper.updateLineRejected(myLine.getLineNo(), dto.getRjctRsn());
            if (updated == 0) {
                throw new IllegalStateException("이미 처리되었거나 처리할 수 없는 결재라인입니다.");
            }

            int docUpdated = aprvMapper.updateDocRejected(aprvNo);
            if (docUpdated == 0) {
                throw new IllegalStateException("문서 상태를 변경할 수 없습니다.");
            }

        } else {
            throw new IllegalArgumentException("action은 APPROVE 또는 REJECT만 가능합니다.");
        }
    }

    @Transactional
    @Override
    public void remove(long aprvNo, String empNo) {
        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        if (doc == null) {
			throw new IllegalStateException("문서를 찾을 수 없습니다.");
		}

        if (aprvMapper.countDocByWriter(aprvNo, empNo) == 0) {
            throw new IllegalStateException("작성자만 취소할 수 있습니다.");
        }

        boolean cancelable =
                DOC_DRAFT.equals(doc.getStatCd()) ||
                DOC_SUBMITTED.equals(doc.getStatCd()) ||
                (DOC_IN_PROGRESS.equals(doc.getStatCd()) && aprvMapper.countApprovedLine(aprvNo) == 0);

        if (!cancelable) {
            throw new IllegalStateException("취소할 수 없는 상태입니다.");
        }

        if (aprvMapper.countApprovedLine(aprvNo) > 0) {
            throw new IllegalStateException("이미 승인 진행된 문서는 취소할 수 없습니다.");
        }

        aprvMapper.updateDocCanceled(aprvNo);
    }


    // 작성

    @Transactional
    @Override
    public long create(AprvCreateDTO dto, String empNo) {

        // DRAFT 덮어쓰기(임시저장/상신)
        if (dto.getAprvNo() != null && dto.getAprvNo() > 0) {
            return overwriteDraft(dto, empNo);
        }

        long aprvNo = aprvMapper.selectNextAprvNo();

        AprvEmpSnapDTO writerSnap = aprvMapper.selectEmpSnapByEmpNo(empNo);
        if (writerSnap == null) {
            throw new IllegalStateException("작성자 정보(부서/직위/이름)를 찾을 수 없습니다.");
        }

        boolean submit = CREATE_SUBMIT.equals(dto.getActionType());

        AprvDocDTO doc = AprvDocDTO.builder()
                .aprvNo(aprvNo)
                .formCd(dto.getFormCd())
                .empNo(empNo)
                .aprvTtl(dto.getAprvTtl())
                .aprvCn(dto.getAprvCn())
                .submitDtm(submit ? LocalDateTime.now() : null)
                .finalDtm(null)
                .docWrtrDeptCd(writerSnap.getDeptCd())
                .docWrtrPosCd(writerSnap.getPosCd())
                .docWrtrEmpNm(writerSnap.getEmpNm())
                .statDiv("DOC")
                .statCd(submit ? DOC_SUBMITTED : DOC_DRAFT)
                .build();

        aprvMapper.insertAprvDoc(doc);

        // =====================================================
        // 수신/참조 저장
        // - (1) 선택 수신/참조
        // - (2) (상신 시) HR 자동 참조
        //   * HR 자동 참조 대상: DEPT_TYPE_CD='HR01' 부서의 재직(ACNT_ACT_YN='Y') 사원 전체
        //   * 작성자는 제외(자기 참조 방지)
        //   * 자동 참조는 화면에 굳이 표시하지 않기 위해 REF_TYPE_CD='AUTO'로 저장
        // =====================================================
        Set<String> uniqRcv = new LinkedHashSet<>();
        Set<String> uniqRef = new LinkedHashSet<>();
        Set<String> uniqAuto = new LinkedHashSet<>();

        // (1) 선택 수신
        if (dto.getRcvEmpNoList() != null) {
            for (String rcvEmpNo : dto.getRcvEmpNoList()) {
                if (rcvEmpNo == null || rcvEmpNo.isBlank()) continue;
                uniqRcv.add(rcvEmpNo.trim());
            }
        }

        // (2) 선택 참조
        if (dto.getRefEmpNoList() != null) {
            for (String refEmpNo : dto.getRefEmpNoList()) {
                if (refEmpNo == null || refEmpNo.isBlank()) continue;
                uniqRef.add(refEmpNo.trim());
            }
        }

        // (3) 상신 시 HR 자동 참조
        if (submit) {
            List<String> hrEmpNos = aprvMapper.selectHrActiveEmpNoList();
            if (hrEmpNos != null) {
                for (String hrEmpNo : hrEmpNos) {
                    if (hrEmpNo == null || hrEmpNo.isBlank()) continue;
                    uniqAuto.add(hrEmpNo.trim());
                }
            }
        }

        // (4) 작성자 제외 + 중복 제거(수신 우선)
        uniqRcv.remove(empNo);
        uniqRef.remove(empNo);
        uniqAuto.remove(empNo);

        // 수신자에 포함된 사원은 참조/자동에서 제거
        for (String rcvEmpNo : uniqRcv) {
            uniqRef.remove(rcvEmpNo);
            uniqAuto.remove(rcvEmpNo);
        }
        // 참조에 포함된 사원은 자동에서 제거
        for (String refEmpNo : uniqRef) {
            uniqAuto.remove(refEmpNo);
        }

        // (5) 저장
        for (String rcvEmpNo : uniqRcv) {
            if (rcvEmpNo == null || rcvEmpNo.isBlank()) continue;
            aprvMapper.insertAprvRef(aprvNo, rcvEmpNo, "RCV", "UNREAD");
        }
        for (String refEmpNo : uniqRef) {
            if (refEmpNo == null || refEmpNo.isBlank()) continue;
            aprvMapper.insertAprvRef(aprvNo, refEmpNo, "REF", "UNREAD");
        }
        for (String autoEmpNo : uniqAuto) {
            if (autoEmpNo == null || autoEmpNo.isBlank()) continue;
            aprvMapper.insertAprvRef(aprvNo, autoEmpNo, "AUTO", "UNREAD");
        }

        // 양식별 상세 저장(문서와 1:1)
        insertFormDetail(dto, aprvNo, empNo);

        // 상신 시에만 결재라인 생성
        if (submit) {
        	
        	// RETIRE는 결재라인 없이 자동 승인 처리
        	if ("RETIRE".equals(dto.getFormCd())) {

        	    // 안전장치: 혹시 남아있을 결재라인 제거
        	    aprvMapper.deleteAprvLineByAprvNo(aprvNo);

	    // SYSTEM + FINAL PDF 생성 (FINAL은 현재 SYSTEM 복사 저장 구조라 이 루트가 안전)
	    try {
	    	aprvPdfService.generateAndSaveSystemPdfOnSubmit(aprvNo, empNo);
	    } catch (Exception ex) {
	    	log.warn("SYSTEM_PDF 생성 실패(RETIRE 상신). aprvNo={}, empNo={}", aprvNo, empNo, ex);
	    }
	    try {
	    	aprvPdfService.generateAndSaveFinalPdf(aprvNo, empNo);
	    } catch (Exception ex) {
	    	log.warn("FINAL_PDF 생성 실패(RETIRE 상신). aprvNo={}, empNo={}", aprvNo, empNo, ex);
	    }

        	    // 문서 상태 SUBMITTED -> APPROVED
        	    int updated = aprvMapper.updateDocApprovedFromSubmitted(aprvNo);
        	    if (updated == 0) {
        	        throw new IllegalStateException("RETIRE 자동승인 처리 실패");
        	    }

        	    return aprvNo;
        	}
        	
        	if (dto.getApproverEmpNoList() == null || dto.getApproverEmpNoList().isEmpty()) {
        	    throw new IllegalStateException("결재라인은 최소 1명 이상 지정해야 합니다.");
        	}

        	if (dto.getApproverEmpNoList().size() > 3) {
        	    throw new IllegalStateException("결재라인은 최대 3명까지 가능합니다.");
        	}
        	
            // 정책: 결재라인 중복 불가 (셀프 결재는 허용)
            Set<String> uniqApproverEmpNos = new LinkedHashSet<>(dto.getApproverEmpNoList());
            if (uniqApproverEmpNos.size() != dto.getApproverEmpNoList().size()) {
                throw new IllegalStateException("결재라인에 동일한 결재자가 중복으로 포함될 수 없습니다.");
            }

            int seq = 1;
            for (String approverEmpNo : uniqApproverEmpNos) {

                AprvEmpSnapDTO approverSnap = aprvMapper.selectEmpSnapByEmpNo(approverEmpNo);
                if (approverSnap == null) {
                    throw new IllegalStateException("결재자 정보를 찾을 수 없습니다. empNo=" + approverEmpNo);
                }

                long lineNo = aprvMapper.selectNextLineNo();

                AprvLineDTO line = AprvLineDTO.builder()
                        .lineNo(lineNo)
                        .aprvNo(aprvNo)
                        .empNo(approverEmpNo)
                        .aprvSeq(seq++)
                        .aprvDtm(null)
                        .rjctRsn(null)
                        .aprverDeptCd(approverSnap.getDeptCd())
                        .aprverPosCd(approverSnap.getPosCd())
                        .aprverEmpNm(approverSnap.getEmpNm())
                        .statDiv("LINE")
                        .statCd(LINE_WAIT)
                        .build();

                aprvMapper.insertAprvLine(line);
            }
			// for문 밖(모든 결재라인 insert 완료 후)
			try {
				aprvPdfService.generateAndSaveSystemPdfOnSubmit(aprvNo, empNo);
			} catch (Exception ex) {
				// PDF 생성 실패가 RuntimeException으로 전파되면 @Transactional 롤백으로 상신 자체가 막힐 수 있음
				// (PDF는 재생성 가능하므로 여기서는 경고만 남기고 진행)
				log.warn("SYSTEM_PDF 생성 실패(상신). aprvNo={}, empNo={}", aprvNo, empNo, ex);
			}
        }

        return aprvNo;
    }

    private void deleteFormDetailByFormCd(long aprvNo, String formCd) {
        if (formCd == null) return;
        switch (formCd) {
            case "LEAVE":
                aprvMapper.deleteAprvLeaveByAprvNo(aprvNo);
                break;
            case "LOA":
                aprvMapper.deleteAprvLoaByAprvNo(aprvNo);
                break;
            case "PROMOTION":
                aprvMapper.deleteAprvPromotionByAprvNo(aprvNo);
                break;
            case "APPOINTMENT":
                aprvMapper.deleteAprvAppointmentByAprvNo(aprvNo);
                break;
            case "HEADCOUNT":
                aprvMapper.deleteAprvHeadcountByAprvNo(aprvNo);
                break;
            case "RETIRE":
                aprvMapper.deleteAprvRetireByAprvNo(aprvNo);
                break;
            default:
                break;
        }
    }

    private void insertFormDetail(AprvCreateDTO dto, long aprvNo, String writerEmpNo) {
        // FORM_CD는 늘어날 수 있어 switch로 모듈화
        String formCd = dto.getFormCd();
        if (formCd == null) {
            return;
        }

        // LEAVE / LOA / PROMOTION / APPOINTMENT / HEADCOUNT / RETIRE
        switch (formCd) {
            case "LEAVE": {
                AprvLeaveDTO leave = dto.getLeave();
                if (leave != null) {
                    leave.setAprvNo(aprvNo);
                    aprvMapper.insertAprvLeave(leave);
                }
                break;
            }
            case "LOA": {
                AprvLoaDTO loa = dto.getLoa();
                if (loa != null) {
                    loa.setAprvNo(aprvNo);
                    aprvMapper.insertAprvLoa(loa);
                }
                break;
            }
            case "PROMOTION": {
                AprvPromotionDTO promotion = dto.getPromotion();
                if (promotion != null) {
                    promotion.setAprvNo(aprvNo);
                    aprvMapper.insertAprvPromotion(promotion);
                }
                break;
            }
            case "APPOINTMENT": {
                AprvAppointmentDTO appointment = dto.getAppointment();
                if (appointment != null) {
                    appointment.setAprvNo(aprvNo);
                    aprvMapper.insertAprvAppointment(appointment);
                }
                break;
            }
            case "HEADCOUNT": {
                AprvHeadcountDTO headcount = dto.getHeadcount();
                if (headcount != null) {
                    headcount.setAprvNo(aprvNo);
                    aprvMapper.insertAprvHeadcount(headcount);
                }
                break;
            }
            case "RETIRE": {
                AprvRetireDTO retire = dto.getRetire();
                if (retire != null) {
                    retire.setRetrNo(aprvMapper.selectNextRetrNo());
                    retire.setAprvNo(aprvNo);
                    if (retire.getEmpNo() == null || retire.getEmpNo().trim().isEmpty()) {
                        retire.setEmpNo(writerEmpNo);
                    }
                    // 프로세스 상태는 별도 정책(인사 담당자 처리 등)이 정해지면 보완
                    aprvMapper.insertAprvRetire(retire);
                }
                break;
            }
            default:
                // 미지원 양식이면 아무것도 하지 않음
        }
    }

    // 상세조회
    @Override
    public AprvReadDTO read(long aprvNo, String empNo) {

        aprvAccessService.assertDocAccess(aprvNo, empNo);

        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        if (doc == null) {
            throw new IllegalStateException("문서를 찾을 수 없습니다.");
        }

        List<AprvLineDTO> lineList = aprvMapper.selectAprvLineListByAprvNo(aprvNo);

        // 결재라인에 적용된 서명/직인 스냅샷
        List<AprvAssetHistDTO> assetHists = aprvMapper.selectAssetHistListByAprvNo(aprvNo);

        // 내 차례인지
        AprvLineDTO myWaitLine = aprvMapper.selectCurrentWaitLine(aprvNo, empNo);
        boolean canApprove = (myWaitLine != null)
                && (DOC_SUBMITTED.equals(doc.getStatCd()) || DOC_IN_PROGRESS.equals(doc.getStatCd()));


        // 취소 가능인지 (작성자 + (DRAFT/SUBMITTED/IN_PROGRESS(승인0)) + 승인라인 0)
        boolean isWriter = empNo.equals(doc.getEmpNo());
        int approvedCnt = aprvMapper.countApprovedLine(aprvNo);

        boolean cancelable =
                DOC_DRAFT.equals(doc.getStatCd()) ||
                DOC_SUBMITTED.equals(doc.getStatCd()) ||
                (DOC_IN_PROGRESS.equals(doc.getStatCd()) && approvedCnt == 0);

        boolean canCancel = isWriter && cancelable && (approvedCnt == 0);
        
        AprvReadDTO.AprvReadDTOBuilder builder = AprvReadDTO.builder()
                .doc(doc)
                .lineList(lineList)
                .canApprove(canApprove)
                .canCancel(canCancel);

        builder.assetHists(assetHists);

        // 양식별 상세 로드
        String formCd = doc.getFormCd();
        if (formCd != null) {
            switch (formCd) {
                case "LEAVE":
                    builder.leave(aprvMapper.selectAprvLeaveByAprvNo(aprvNo));
                    break;
                case "LOA":
                    builder.loa(aprvMapper.selectAprvLoaByAprvNo(aprvNo));
                    break;
                case "PROMOTION":
                    builder.promotion(aprvMapper.selectAprvPromotionByAprvNo(aprvNo));
                    break;
                case "APPOINTMENT":
                    builder.appointment(aprvMapper.selectAprvAppointmentByAprvNo(aprvNo));
                    break;
                case "HEADCOUNT":
                    builder.headcount(aprvMapper.selectAprvHeadcountByAprvNo(aprvNo));
                    break;
                case "RETIRE":
                    builder.retire(aprvMapper.selectAprvRetireByAprvNo(aprvNo));
                    break;
                default:
            }
        }

        // 참조/파일
        List<AprvRefDTO> refs = aprvMapper.selectAprvRefListByAprvNo(aprvNo);
        if (refs != null) {
            // AUTO(HR 자동참조)는 화면 노출 불필요 -> 목록에서 제외(권한/열람체크에는 영향 없음)
            refs.removeIf(r -> "AUTO".equals(r.getRefTypeCd()));
        }
        List<ApprFileDTO> files = aprvMapper.selectApprFileListByAprvNo(aprvNo);
        builder.refs(refs).files(files);

        return builder.build();
    }





    private long overwriteDraft(AprvCreateDTO dto, String empNo) {

        long aprvNo = dto.getAprvNo();

        AprvDocDTO doc = aprvMapper.selectAprvDocByAprvNo(aprvNo);
        if (doc == null) {
            throw new IllegalStateException("문서를 찾을 수 없습니다.");
        }

        if (!empNo.equals(doc.getEmpNo())) {
            throw new IllegalStateException("작성자만 임시저장을 수정할 수 있습니다.");
        }

        if (!DOC_DRAFT.equals(doc.getStatCd())) {
            throw new IllegalStateException("임시저장(DRAFT) 상태에서만 수정할 수 있습니다.");
        }

        boolean submit = CREATE_SUBMIT.equals(dto.getActionType());

        AprvEmpSnapDTO writerSnap = aprvMapper.selectEmpSnapByEmpNo(empNo);
        if (writerSnap == null) {
            throw new IllegalStateException("작성자 정보(부서/직위/이름)를 찾을 수 없습니다.");
        }

        // 1) 문서 업데이트 (DRAFT 유지 or SUBMITTED 전환)
        aprvMapper.updateAprvDocOnOverwrite(
                aprvNo,
                dto.getFormCd(),
                dto.getAprvTtl(),
                dto.getAprvCn(),
                writerSnap.getDeptCd(),
                writerSnap.getPosCd(),
                writerSnap.getEmpNm(),
                submit ? DOC_SUBMITTED : DOC_DRAFT,
                submit ? LocalDateTime.now() : null
        );

        // 2) 양식 상세: 기존 삭제 후 재삽입
        deleteFormDetailByFormCd(aprvNo, dto.getFormCd());
        insertFormDetail(dto, aprvNo, empNo);

        // 3) 수신/참조: 삭제 후 재삽입 (선택 수신/참조 + (상신 시) HR 자동 참조)
        aprvMapper.deleteAprvRefByAprvNo(aprvNo);

        Set<String> uniqRcv = new LinkedHashSet<>();
        Set<String> uniqRef = new LinkedHashSet<>();
        Set<String> uniqAuto = new LinkedHashSet<>();

        if (dto.getRcvEmpNoList() != null) {
            for (String rcvEmpNo : dto.getRcvEmpNoList()) {
                if (rcvEmpNo == null || rcvEmpNo.isBlank()) continue;
                uniqRcv.add(rcvEmpNo.trim());
            }
        }

        if (dto.getRefEmpNoList() != null) {
            for (String refEmpNo : dto.getRefEmpNoList()) {
                if (refEmpNo == null || refEmpNo.isBlank()) continue;
                uniqRef.add(refEmpNo.trim());
            }
        }

        if (submit) {
            List<String> hrEmpNos = aprvMapper.selectHrActiveEmpNoList();
            if (hrEmpNos != null) {
                for (String hrEmpNo : hrEmpNos) {
                    if (hrEmpNo == null || hrEmpNo.isBlank()) continue;
                    uniqAuto.add(hrEmpNo.trim());
                }
            }
        }

        uniqRcv.remove(empNo);
        uniqRef.remove(empNo);
        uniqAuto.remove(empNo);

        for (String rcvEmpNo : uniqRcv) {
            uniqRef.remove(rcvEmpNo);
            uniqAuto.remove(rcvEmpNo);
        }
        for (String refEmpNo : uniqRef) {
            uniqAuto.remove(refEmpNo);
        }

        for (String rcvEmpNo : uniqRcv) {
            if (rcvEmpNo == null || rcvEmpNo.isBlank()) continue;
            aprvMapper.insertAprvRef(aprvNo, rcvEmpNo, "RCV", "UNREAD");
        }
        for (String refEmpNo : uniqRef) {
            if (refEmpNo == null || refEmpNo.isBlank()) continue;
            aprvMapper.insertAprvRef(aprvNo, refEmpNo, "REF", "UNREAD");
        }
        for (String autoEmpNo : uniqAuto) {
            if (autoEmpNo == null || autoEmpNo.isBlank()) continue;
            aprvMapper.insertAprvRef(aprvNo, autoEmpNo, "AUTO", "UNREAD");
        }

        // 4) 상신이면 결재라인 생성 + SYSTEM_PDF 생성
        if (submit) {
        	
        	// RETIRE는 결재라인 없이 자동 승인 처리
        	if ("RETIRE".equals(dto.getFormCd())) {

        	    // 혹시 남아있을 결재라인 제거
        	    aprvMapper.deleteAprvLineByAprvNo(aprvNo);

	        	    // SYSTEM + FINAL PDF 생성
	        	    try {
	        	    	aprvPdfService.generateAndSaveSystemPdfOnSubmit(aprvNo, empNo);
	        	    } catch (Exception ex) {
	        	    	log.warn("SYSTEM_PDF 생성 실패(RETIRE 상신). aprvNo={}, empNo={}", aprvNo, empNo, ex);
	        	    }
	        	    try {
	        	    	aprvPdfService.generateAndSaveFinalPdf(aprvNo, empNo);
	        	    } catch (Exception ex) {
	        	    	log.warn("FINAL_PDF 생성 실패(RETIRE 상신). aprvNo={}, empNo={}", aprvNo, empNo, ex);
	        	    }

	        	    // 문서 상태 SUBMITTED -> APPROVED
        	    int updated = aprvMapper.updateDocApprovedFromSubmitted(aprvNo);
        	    if (updated == 0) {
        	        throw new IllegalStateException("RETIRE 자동승인 처리 실패");
        	    }

        	    return aprvNo;
        	}

            if (dto.getApproverEmpNoList() == null || dto.getApproverEmpNoList().isEmpty()) {
                throw new IllegalStateException("결재라인은 최소 1명 이상 지정해야 합니다.");
            }

            if (dto.getApproverEmpNoList().size() > 3) {
                throw new IllegalStateException("결재라인은 최대 3명까지 가능합니다.");
            }

            Set<String> uniqApproverEmpNos = new LinkedHashSet<>(dto.getApproverEmpNoList());
            if (uniqApproverEmpNos.size() != dto.getApproverEmpNoList().size()) {
                throw new IllegalStateException("결재라인에 동일한 결재자가 중복으로 포함될 수 없습니다.");
            }

            // 기존 라인이 남아있을 수 있으니 제거 후 재생성
            aprvMapper.deleteAprvLineByAprvNo(aprvNo);

            int seq = 1;
            for (String approverEmpNo : uniqApproverEmpNos) {

                AprvEmpSnapDTO approverSnap = aprvMapper.selectEmpSnapByEmpNo(approverEmpNo);
                if (approverSnap == null) {
                    throw new IllegalStateException("결재자 정보를 찾을 수 없습니다. empNo=" + approverEmpNo);
                }

                long lineNo = aprvMapper.selectNextLineNo();

                AprvLineDTO line = AprvLineDTO.builder()
                        .lineNo(lineNo)
                        .aprvNo(aprvNo)
                        .empNo(approverEmpNo)
                        .aprvSeq(seq++)
                        .aprvDtm(null)
                        .rjctRsn(null)
                        .aprverDeptCd(approverSnap.getDeptCd())
                        .aprverPosCd(approverSnap.getPosCd())
                        .aprverEmpNm(approverSnap.getEmpNm())
                        .statDiv("LINE")
                        .statCd(LINE_WAIT)
                        .build();

                aprvMapper.insertAprvLine(line);
            }

	            try {
	            	aprvPdfService.generateAndSaveSystemPdfOnSubmit(aprvNo, empNo);
	            } catch (Exception ex) {
	            	log.warn("SYSTEM_PDF 생성 실패(상신). aprvNo={}, empNo={}", aprvNo, empNo, ex);
	            }
        }

        return aprvNo;
    }
    
    @Override
    public String readDeptHeadEmpNo(String deptCd) {
      return aprvMapper.selectDeptHeadEmpNoByDeptCd(deptCd);
    }

    @Override
    public List<AprvAssetHistDTO> readAssetHistList(long aprvNo, String empNo) {
        aprvAccessService.assertDocAccess(aprvNo, empNo);
        return aprvMapper.selectAssetHistListByAprvNo(aprvNo);
    }
    
    
}
