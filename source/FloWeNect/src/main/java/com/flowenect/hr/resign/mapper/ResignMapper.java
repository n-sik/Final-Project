package com.flowenect.hr.resign.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.flowenect.hr.dto.resign.ResignDTO;
import com.flowenect.hr.dto.resign.ResignApproveDTO;

@Mapper
public interface ResignMapper {

    // ── 조회 ────────────────────────────────────────
    /** FORM_CD='RETIRE', STAT_CD='APPROVED' 인 대기 목록 + 완료/반려 포함 전체 */
    List<ResignDTO> selectResignList(ResignDTO param);
    ResignDTO       selectResignDetail(String aprvNo);
    int             selectResignCount(ResignDTO param);

    // ── 처리 (APRV_DOC.STAT_CD 기준) ────────────────
    /** [단건] APRV_DOC.STAT_CD 업데이트 + FINAL_DTM */
    int updateAprvDocStat(ResignApproveDTO param);

    /** [다건] APRV_DOC.STAT_CD 일괄 업데이트 + FINAL_DTM */
    int updateAprvDocStatBulk(ResignApproveDTO param);

    /** COMPLETED 시 EMP.ACNT_ACT_YN = 'N' 처리 */
    int updateEmpInactive(String empNo);

    /** 다건 완료 시 empNo 목록 조회용 */
    List<ResignDTO> selectResignDetailsByAprvNos(List<String> aprvNos);
}