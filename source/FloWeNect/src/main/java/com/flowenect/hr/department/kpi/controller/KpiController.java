package com.flowenect.hr.department.kpi.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import com.flowenect.hr.department.kpi.service.KpiService;
import com.flowenect.hr.department.kpi.service.ProjectListReadService;
import com.flowenect.hr.department.kpi.service.TaskService;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.kpi.KpiDTO;
import com.flowenect.hr.dto.kpi.TaskDTO;
import com.flowenect.hr.security.AuthenticationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("leader/kpi/readList")
@RequiredArgsConstructor
public class KpiController {

    private final ProjectListReadService projectListReadService;
    private final KpiService kpiService;
    private final TaskService taskService;

    @GetMapping
    public String kpiForm(
            @RequestParam(required = false) String deptCd,
            Authentication authentication,
            Model model) {

        EmpDTO loginUser = requireLoginUser(authentication);
        String loginDeptCd = loginUser.getDeptCd();
        String activeDeptCd = (deptCd != null && !deptCd.isBlank()) ? deptCd : loginDeptCd;

        model.addAttribute("loginDeptCd", loginDeptCd);
        model.addAttribute("loginDeptNm", resolveDeptNm(loginDeptCd));
        model.addAttribute("activeDeptCd", activeDeptCd);

        if (activeDeptCd != null && !activeDeptCd.isBlank()) {
            model.addAttribute("projectList", projectListReadService.getProjectListForView(activeDeptCd));
        }

        return "department/kpi/kpiForm";
    }

    @GetMapping("/getKpis")
    @ResponseBody
    public ResponseEntity<List<KpiDTO>> getKpiList(@RequestParam("projNo") Long projNo) {
        return ResponseEntity.ok(kpiService.getKpiListByProj(projNo));
    }

    @GetMapping("/getKpiDetail")
    @ResponseBody
    public ResponseEntity<KpiDTO> getKpiDetail(@RequestParam("kpiNo") Long kpiNo) {
        return ResponseEntity.ok(kpiService.getKpiDetail(kpiNo));
    }

    @PostMapping("/register")
    @ResponseBody
    public String registerKpi(@RequestBody KpiDTO kpiDto, Authentication authentication) {
        if (kpiDto.getRegEmpNo() == null || kpiDto.getRegEmpNo().isBlank()) {
            kpiDto.setRegEmpNo(requireLoginUser(authentication).getEmpNo());
        }
        if (kpiDto.getKpiParentNo() == null) {
            kpiDto.setKpiParentNo(0L);
        }
        return kpiService.registerKpi(kpiDto) > 0 ? "success" : "fail";
    }

    @GetMapping("/getSubKpis")
    @ResponseBody
    public ResponseEntity<List<KpiDTO>> getSubKpiList(@RequestParam("parentNo") Long parentNo) {
        return ResponseEntity.ok(kpiService.getSubKpiListByParent(parentNo));
    }

    @PostMapping("/update")
    @ResponseBody
    public String updateKpi(@RequestBody KpiDTO kpiDto) {
        return kpiService.modifyKpi(kpiDto) > 0 ? "success" : "fail";
    }

    @GetMapping("/getTaskList")
    @ResponseBody
    public ResponseEntity<List<TaskDTO>> getTaskList(@RequestParam("kpiNo") Long kpiNo) {
        return ResponseEntity.ok(taskService.getTaskListByKpi(kpiNo));
    }

    @PostMapping("/registerTask")
    @ResponseBody
    public String registerTask(@RequestBody TaskDTO taskDto, Authentication authentication) {
        if (taskDto.getEmpNo() == null || taskDto.getEmpNo().isBlank()) {
            taskDto.setEmpNo(requireLoginUser(authentication).getEmpNo());
        }
        return taskService.registerTask(taskDto);
    }

    @GetMapping("/getTaskDetail")
    @ResponseBody
    public ResponseEntity<TaskDTO> getTaskDetail(@RequestParam("taskNo") Long taskNo) {
        return ResponseEntity.ok(taskService.getTaskDetail(taskNo));
    }

    @PostMapping("/updateTask")
    @ResponseBody
    public String updateTask(@RequestBody TaskDTO taskDto) {
        return taskService.modifyTask(taskDto);
    }

    @PostMapping("/deleteTask")
    @ResponseBody
    public String deleteTask(@RequestParam("taskNo") Long taskNo) {
        return taskService.removeTask(taskNo);
    }

    @GetMapping("/getDeptMembers")
    @ResponseBody
    public List<TaskDTO> getDeptMembers(@RequestParam("deptCd") String deptCd) {
        log.info("📥 사원 목록 조회 - 부서코드: {}", deptCd);
        List<TaskDTO> members = taskService.getDeptMembers(deptCd);
        log.info("✅ 조회 결과: {}명", members != null ? members.size() : 0);
        return members;
    }

    private EmpDTO requireLoginUser(Authentication authentication) {
        try {
            EmpDTO user = AuthenticationUtils.getRealUser(authentication);
            if (user == null || user.getEmpNo() == null || user.getEmpNo().isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 사용자 정보를 확인할 수 없습니다.");
            }
            return user;
        } catch (Exception e) {
            if (e instanceof ResponseStatusException rse) throw rse;
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인 사용자 정보를 확인할 수 없습니다.");
        }
    }

    private String resolveDeptNm(String deptCd) {
        return switch (deptCd != null ? deptCd : "") {
            case "2026HR01" -> "인사부서";
            case "2026PD01" -> "생산제조부서";
            case "2026DV01" -> "개발1부서";
            case "2026DV02" -> "개발2부서";
            case "2026PM01" -> "서비스기획부서";
            case "2026CS01" -> "고객지원부서";
            case "2026MK01" -> "마케팅부서";
            case "2026SL01" -> "영업부서";
            default -> deptCd;
        };
    }
}
