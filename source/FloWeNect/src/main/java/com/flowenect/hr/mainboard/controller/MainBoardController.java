package com.flowenect.hr.mainboard.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.flowenect.hr.dto.attendance.AttendanceDTO;
import com.flowenect.hr.dto.mainboard.AttdModalDTO;
import com.flowenect.hr.dto.mainboard.MainBoardDTO;
import com.flowenect.hr.mainboard.service.MainBoardService;
import com.flowenect.hr.security.auth.EmpDTOWrapper;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class MainBoardController {
  
    private final MainBoardService mainBoardService;

    // 메인 페이지를 의미상 index 페이지로 사용 + /main도 같이 열리게 호환
    @GetMapping({"/", "/main"})
    public String main(@AuthenticationPrincipal EmpDTOWrapper principal, Model model) {

    	/*
        // 로그인 전이면 시큐리티가 /login으로 보내지만, NPE 방지용
        if (principal == null || principal.getRealUser() == null) {
            return "redirect:/login";
        }
		*/

        String empNo = principal.getRealUser().getEmpNo();

        MainBoardDTO board = mainBoardService.readMainBoard(empNo);

        // mainboard.jsp에서 쓰는 이름(board/attd/daily)로 맞춰서 내려줌
        model.addAttribute("board", board);
        model.addAttribute("attd", board.getTodayAttendance());
        model.addAttribute("daily", board.getYesterdayDaily());

        // /WEB-INF/views/main/mainboard.jsp
        return "mainboard/mainboard";
    }

    @PostMapping("/attendance/create-in")
    public String createAttendanceIn(@AuthenticationPrincipal EmpDTOWrapper principal) {

        if (principal == null || principal.getRealUser() == null) {
            return "redirect:/login";
        }

        String empNo = principal.getRealUser().getEmpNo();
        mainBoardService.createAttendanceIn(empNo);

        return "redirect:/main";
    }

    @PostMapping("/attendance/modify-out")
    public String modifyAttendanceOut(@AuthenticationPrincipal EmpDTOWrapper principal) {

        if (principal == null || principal.getRealUser() == null) {
            return "redirect:/login";
        }

        String empNo = principal.getRealUser().getEmpNo();
        mainBoardService.modifyAttendanceOut(empNo);

        return "redirect:/main";
    }
    
    @GetMapping("/attendance/modal-data")
    @ResponseBody
    public Map<String, Object> attdModalData(
            @AuthenticationPrincipal EmpDTOWrapper principal) {

        String empNo = principal.getRealUser().getEmpNo();

        // 기록
        List<AttendanceDTO> records = mainBoardService.readMonthAttendance(empNo);

        // 통계
        Map<String, Object> rawStats = mainBoardService.readMonthAttdStats(empNo);
        AttdModalDTO.AttdStatsDTO stats = new AttdModalDTO.AttdStatsDTO();
        stats.setWorkDays(   toInt(rawStats.get("WORK_DAYS")));
        stats.setLateDays(   toInt(rawStats.get("LATE_DAYS")));
        stats.setAbsentDays( toInt(rawStats.get("ABSENT_DAYS")));
        stats.setAutoOutDays(toInt(rawStats.get("AUTO_OUT_DAYS")));

        Map<String, Object> result = new HashMap<>();
        result.put("records", records);
        result.put("stats",   stats);
        return result;
    }

    private int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).intValue();
        return Integer.parseInt(o.toString());
    }

}
