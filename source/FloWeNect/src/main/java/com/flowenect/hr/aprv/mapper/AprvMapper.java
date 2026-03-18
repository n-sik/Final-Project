package com.flowenect.hr.aprv.mapper;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.aprv.ApprFileDTO;
import com.flowenect.hr.dto.aprv.AprvAppointmentDTO;
import com.flowenect.hr.dto.aprv.AprvAssetHistDTO;
import com.flowenect.hr.dto.aprv.AprvCodeDTO;
import com.flowenect.hr.dto.aprv.AprvDocDTO;
import com.flowenect.hr.dto.aprv.AprvDocListRowDTO;
import com.flowenect.hr.dto.aprv.AprvEmpOptionDTO;
import com.flowenect.hr.dto.aprv.AprvEmpSnapDTO;
import com.flowenect.hr.dto.aprv.AprvFormTypeDTO;
import com.flowenect.hr.dto.aprv.AprvHeadcountDTO;
import com.flowenect.hr.dto.aprv.AprvLeaveDTO;
import com.flowenect.hr.dto.aprv.AprvLineDTO;
import com.flowenect.hr.dto.aprv.AprvLoaDTO;
import com.flowenect.hr.dto.aprv.AprvPromotionDTO;
import com.flowenect.hr.dto.aprv.AprvReadListCondDTO;
import com.flowenect.hr.dto.aprv.AprvRefDTO;
import com.flowenect.hr.dto.aprv.AprvRetireDTO;
import com.flowenect.hr.dto.aprv.AprvSignAssetDTO;

@Mapper
public interface AprvMapper {

    // ===============================
    // 작성 화면 옵션/코드
    // ===============================

    List<AprvFormTypeDTO> selectAprvFormTypeList();

    List<AprvEmpOptionDTO> selectAprvEmpOptionList();

    List<AprvEmpOptionDTO> selectDeptHeadEmpOptionList();

    List<AprvCodeDTO> selectAprvStatCdList(@Param("statDiv") String statDiv);

    List<AprvCodeDTO> selectDeptCodeList();

    List<AprvCodeDTO> selectPosCodeList();

    AprvEmpSnapDTO selectEmpSnapByEmpNo(@Param("empNo") String empNo);

    /**
     * HR 자동 참조 대상: DEPT_TYPE_CD='HR01' 부서의 재직(ACNT_ACT_YN='Y') 사원 전체
     */
    List<String> selectHrActiveEmpNoList();

    String selectDeptHeadEmpNoByDeptCd(@Param("deptCd") String deptCd);

    AprvSignAssetDTO selectLatestAprvSign(@Param("empNo") String empNo, @Param("assetTypeCd") String assetTypeCd);

    int insertAprvSignAsset(
            @Param("empNo") String empNo,
            @Param("assetTypeCd") String assetTypeCd,
            @Param("assetNm") String assetNm,
            @Param("filePath") String filePath
    );

    List<AprvSignAssetDTO> selectAprvSignAssetList(
            @Param("empNo") String empNo,
            @Param("assetTypeCd") String assetTypeCd
    );

    AprvSignAssetDTO selectAprvSignAssetByAssetNo(
            @Param("assetNo") long assetNo,
            @Param("empNo") String empNo
    );

    // ===============================
    // 목록(페이징)
    // ===============================

    int selectAprvDocReadListCount(@Param("cond") AprvReadListCondDTO cond, @Param("empNo") String empNo);

    List<AprvDocListRowDTO> selectAprvDocReadList(
            @Param("cond") AprvReadListCondDTO cond,
            @Param("empNo") String empNo,
            @Param("startRow") int startRow,
            @Param("endRow") int endRow
    );

    // ===============================
    // 시퀀스
    // ===============================

    long selectNextAprvNo();

    long selectNextLineNo();

    long selectNextRetrNo();

    // ===============================
    // 문서(APRV_DOC)
    // ===============================

    int insertAprvDoc(AprvDocDTO doc);

    AprvDocDTO selectAprvDocByAprvNo(@Param("aprvNo") long aprvNo);

    int updateAprvDocOnOverwrite(
            @Param("aprvNo") long aprvNo,
            @Param("formCd") String formCd,
            @Param("aprvTtl") String aprvTtl,
            @Param("aprvCn") String aprvCn,
            @Param("deptCd") String deptCd,
            @Param("posCd") String posCd,
            @Param("empNm") String empNm,
            @Param("statCd") String statCd,
            @Param("submitDtm") LocalDateTime submitDtm
    );

    int updateDocInProgressFromSubmitted(@Param("aprvNo") long aprvNo);

    int updateDocApproved(@Param("aprvNo") long aprvNo);

    int updateDocApprovedFromSubmitted(@Param("aprvNo") long aprvNo);

    int updateDocRejected(@Param("aprvNo") long aprvNo);

    int updateDocCanceled(@Param("aprvNo") long aprvNo);

    int countDocByWriter(@Param("aprvNo") long aprvNo, @Param("empNo") String empNo);

    // ===============================
    // 결재선(APRV_LINE)
    // ===============================

    int insertAprvLine(AprvLineDTO line);

    int deleteAprvLineByAprvNo(@Param("aprvNo") long aprvNo);

    List<AprvLineDTO> selectAprvLineListByAprvNo(@Param("aprvNo") long aprvNo);

    AprvLineDTO selectCurrentWaitLine(@Param("aprvNo") long aprvNo, @Param("empNo") String empNo);

    int updateLineApproved(@Param("lineNo") long lineNo, @Param("empNo") String empNo);

    int updateLineRejected(@Param("lineNo") long lineNo, @Param("rjctRsn") String rjctRsn);

    int countRemainingWaitLines(@Param("aprvNo") long aprvNo);

    int countApprovedLine(@Param("aprvNo") long aprvNo);

    int countAnyApprovedLine(@Param("aprvNo") long aprvNo);

    // ===============================
    // 참조(APRV_REF)
    // ===============================

    int insertAprvRef(
            @Param("aprvNo") long aprvNo,
            @Param("empNo") String empNo,
            @Param("refTypeCd") String refTypeCd,
            @Param("refStatCd") String refStatCd
    );

    int deleteAprvRefByAprvNo(@Param("aprvNo") long aprvNo);

    List<AprvRefDTO> selectAprvRefListByAprvNo(@Param("aprvNo") long aprvNo);

    // ===============================
    // 첨부(APPR_FILE)
    // ===============================

    int insertApprFile(
            @Param("aprvNo") long aprvNo,
            @Param("fileNm") String fileNm,
            @Param("saveFileNm") String saveFileNm,
            @Param("filePath") String filePath,
            @Param("fileSize") long fileSize,
            @Param("fileExt") String fileExt,
            @Param("fileDiv") String fileDiv
    );

    int insertSystemPdfFile(
            @Param("aprvNo") long aprvNo,
            @Param("fileNm") String fileNm,
            @Param("saveFileNm") String saveFileNm,
            @Param("filePath") String filePath,
            @Param("fileSize") long fileSize,
            @Param("fileExt") String fileExt
    );

    ApprFileDTO selectApprFileByFileNo(@Param("fileNo") long fileNo);

    List<ApprFileDTO> selectApprFileListByAprvNo(@Param("aprvNo") long aprvNo);

    ApprFileDTO selectLatestPdfByAprvNo(@Param("aprvNo") long aprvNo);

    ApprFileDTO selectLatestPdfByAprvNoAndDiv(@Param("aprvNo") long aprvNo, @Param("fileDiv") String fileDiv);

    // ===============================
    // 접근 통제
    // ===============================

    int existsDocAccess(@Param("aprvNo") long aprvNo, @Param("empNo") String empNo);

    // ===============================
    // 양식별 상세(APRV_*)
    // ===============================

    AprvLeaveDTO selectAprvLeaveByAprvNo(@Param("aprvNo") long aprvNo);

    AprvLoaDTO selectAprvLoaByAprvNo(@Param("aprvNo") long aprvNo);

    AprvPromotionDTO selectAprvPromotionByAprvNo(@Param("aprvNo") long aprvNo);

    AprvAppointmentDTO selectAprvAppointmentByAprvNo(@Param("aprvNo") long aprvNo);

    AprvHeadcountDTO selectAprvHeadcountByAprvNo(@Param("aprvNo") long aprvNo);

    AprvRetireDTO selectAprvRetireByAprvNo(@Param("aprvNo") long aprvNo);

    int insertAprvLeave(AprvLeaveDTO dto);

    int insertAprvLoa(AprvLoaDTO dto);

    int insertAprvPromotion(AprvPromotionDTO dto);

    int insertAprvAppointment(AprvAppointmentDTO dto);

    int insertAprvHeadcount(AprvHeadcountDTO dto);

    int insertAprvRetire(AprvRetireDTO dto);

    int deleteAprvLeaveByAprvNo(@Param("aprvNo") long aprvNo);

    int deleteAprvLoaByAprvNo(@Param("aprvNo") long aprvNo);

    int deleteAprvPromotionByAprvNo(@Param("aprvNo") long aprvNo);

    int deleteAprvAppointmentByAprvNo(@Param("aprvNo") long aprvNo);

    int deleteAprvHeadcountByAprvNo(@Param("aprvNo") long aprvNo);

    int deleteAprvRetireByAprvNo(@Param("aprvNo") long aprvNo);

    // ===============================
    // 자산이력(ASSET_HIST)
    // ===============================

    int insertAssetHist(
            @Param("assetTypeCd") String assetTypeCd,
            @Param("lineNo") long lineNo,
            @Param("assetNo") long assetNo,
            @Param("assetNmSnap") String assetNmSnap,
            @Param("filePathSnap") String filePathSnap
    );

    List<AprvAssetHistDTO> selectAssetHistListByAprvNo(@Param("aprvNo") long aprvNo);

    AprvAssetHistDTO selectAssetHistByLineNoAndType(@Param("lineNo") long lineNo, @Param("assetTypeCd") String assetTypeCd);

    Long selectAprvNoByLineNo(@Param("lineNo") long lineNo);
}