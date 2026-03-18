package com.flowenect.hr.emp.mapper;

import java.time.LocalDate;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.flowenect.hr.dto.DeptDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.FileDTO;
import com.flowenect.hr.dto.PositionDTO;
import com.flowenect.hr.dto.accesslog.AccessLogDTO;
import com.flowenect.hr.dto.common.SearchRequest;

@Mapper
public interface EmpMapper {

    /**
     * 로그인 인증에 필요한 최소 사용자 조회
     * - EMP_NO로 조회
     */
    EmpDTO selectEmpForAuth(@Param("empNo") String empNo);

    /**
     * 사원 권한 목록 조회 (EMP_ROLE)
     * - ROLE_CD 값이 ROLE_USER 형태이므로 그대로 Authority로 사용
     */
    List<String> selectEmpRoleCds(@Param("empNo") String empNo);

    /**
     * @param useYn "Y" 전달 시 사용중인 것만, null 전달 시 전체 조회
     * useYn "Y" 전달 시 직위 목록 (선택박스), null 전달 시 직위 관리 - 직위 목록 조회
     */
    List<PositionDTO> selectPosList(@Param("useYn") String useYn);

    /**
     * @param pos
     * 직위 관리 - 직위 등록
     */
    int insertPos(PositionDTO pos);
    
    /**
     * @param pos
     * 직위 관리 - 직위 수정
     */
    int updatePos(PositionDTO pos);
    
    /**
     * @param posCd
     * 직위 관리 - 직위 삭제
     */
    int deletePos(String posCd);
    
    /**
     * 부서 목록 (선택박스)
     */
    List<DeptDTO> selectDeptList();

    String selectNextEmpNo(String hireDt);
//    int insertEmpRole(EmpDTO emp);


    /**
     * @param empNo
     * 특정 사원 조회
     */
    EmpDTO selectEmp(@Param("empNo") String empNo);

    /**
     * 사원 목록 조회
     */
    List<EmpDTO> selectEmpList();

    /**
     * 사원 등록
     */
    int insertEmp(EmpDTO emp);

    /**
     * 사원 수정
     */
    int updateEmp(EmpDTO emp);

    int deleteEmp(@Param("empNo") String empNo);

    int updatePassword(EmpDTO emp);

    // 권한 부여/회수
    int insertEmpRole(@Param("empNo") String empNo, @Param("roleCd") String roleCd);

    int deleteEmpRole(@Param("empNo") String empNo, @Param("roleCd") String roleCd);

    int deleteEmpRoles(@Param("empNo") String empNo);

    // 사원 첨부파일 (EmpFile) - 프로필, 통장사본, 신분증 사본 등
    int insertEmpFile(FileDTO file);

    // 프로필 경로 같은 것도 empNo는 String
    int updateProfilePath(@Param("empNo") String empNo, @Param("profilePath") String profilePath);

    
    
    // [접속이력] 로그인/로그아웃/세션만료/JWT발급 통합
    int insertAccessLog(AccessLogDTO log);

    int updateAccessLogLogout(@Param("accessLogNo") Long accessLogNo,
                              @Param("logoutIp") String logoutIp,
                              @Param("logoutReason") String logoutReason);

    int updateAccessLogTimeout(@Param("accessLogNo") Long accessLogNo,
                               @Param("logoutReason") String logoutReason);

    int updateAccessLogTokenMeta(@Param("accessLogNo") Long accessLogNo,
                                 @Param("authChannel") String authChannel,
                                 @Param("tokenJti") String tokenJti,
                                 @Param("tokenExpDtm") java.time.LocalDateTime tokenExpDtm);

    List<AccessLogDTO> selectAccessLogList(SearchRequest searchRequest);

    int selectAccessLogCount(SearchRequest searchRequest);

    AccessLogDTO selectAccessLogDetail(@Param("accessLogNo") Long accessLogNo);
    //

    
    String getNewEmpNo(LocalDate hireDt);
    
    // 사번으로 부서 상세 정보
    DeptDTO selectDeptInfoByEmpNo(String empNo);
}
