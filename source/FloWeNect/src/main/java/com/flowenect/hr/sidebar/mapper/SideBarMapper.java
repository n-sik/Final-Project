package com.flowenect.hr.sidebar.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.flowenect.hr.dto.sidebar.EmpMenuSetDTO;
import com.flowenect.hr.dto.sidebar.MenuDTO;

@Mapper
public interface SideBarMapper {
	
	// 1. 전체 메뉴 조회 (개인 정렬 반영)
    List<MenuDTO> selectMenuListByEmp(String empNo);

    // 2. 기존 개인 정렬 삭제
    int deleteEmpMenuSort(String empNo);

    // 3. 개인 정렬 저장
    int insertEmpMenuSort(EmpMenuSetDTO dto);
}
