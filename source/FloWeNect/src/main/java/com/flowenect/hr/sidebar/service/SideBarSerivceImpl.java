package com.flowenect.hr.sidebar.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.sidebar.EmpMenuSetDTO;
import com.flowenect.hr.dto.sidebar.MenuDTO;
import com.flowenect.hr.sidebar.mapper.SideBarMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SideBarSerivceImpl implements SideBarService {
	
	private final SideBarMapper sideBarMapper;
	
	@Override
	public List<MenuDTO> getMenuList(String empNo) {
		return sideBarMapper.selectMenuListByEmp(empNo);
	}
	

	@Override
	@Transactional
	public void saveMenuOrder(String empNo, List<Long> menuOrderList) {
		 // 1. 기존 정렬 삭제
        sideBarMapper.deleteEmpMenuSort(empNo);

        // 2. 새 순서 저장
        for (int i = 0; i < menuOrderList.size(); i++) {

            EmpMenuSetDTO dto = EmpMenuSetDTO.builder()
                    .empNo(empNo)
                    .menuNo(menuOrderList.get(i))
                    .sortOrd(i + 1)
                    .build();

            sideBarMapper.insertEmpMenuSort(dto);

        }
	}
}
