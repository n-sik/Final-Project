package com.flowenect.hr.resign.service;

import java.util.List;
import com.flowenect.hr.dto.resign.ResignDTO;
import com.flowenect.hr.dto.resign.ResignApproveDTO;

public interface ResignService {

    List<ResignDTO> getResignList(ResignDTO param);
    ResignDTO       getResignDetail(String aprvNo);
    int             getResignCount(ResignDTO param);

    /**
     * 단건 처리
     * statCd = "COMPLETED" → STAT_CD 변경 + EMP.ACNT_ACT_YN='N'
     * statCd = "REJECTED"  → STAT_CD 변경만
     */
    void approveOne(ResignApproveDTO param);

    /** 다건 처리 */
    void approveBulk(ResignApproveDTO param);
}