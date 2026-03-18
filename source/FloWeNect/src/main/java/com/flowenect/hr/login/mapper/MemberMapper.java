package com.flowenect.hr.login.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemberMapper {

    /** 사번 찾기: 이름 + 이메일로 사번 조회 */
    String findEmpNoByNameAndEmail(
            @Param("name")  String name,
            @Param("email") String email
    );

    /** 비밀번호 찾기 검증: 사번 + 이름 + 이메일 일치 건수 */
    int countByEmpNoAndNameAndEmail(
            @Param("empNo") String empNo,
            @Param("name")  String name,
            @Param("email") String email
    );

    /** 계정 활성 여부 조회 */
    String findAcntActYn(@Param("empNo") String empNo);

    /** 비밀번호 업데이트 */
    int updatePassword(
            @Param("empNo") String empNo,
            @Param("pwd")   String pwd
    );
}
