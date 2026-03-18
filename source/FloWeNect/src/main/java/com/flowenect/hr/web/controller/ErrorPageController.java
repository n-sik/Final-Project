package com.flowenect.hr.web.controller;

import java.util.List;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Controller
public class ErrorPageController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, HttpServletResponse response, Model model) {
        int status = resolveStatus(request, response);
        bind(model, status);
        response.setStatus(status);
        return "error/error";
    }

    @GetMapping("/error/{status}")
    public String handleManualError(@PathVariable int status, HttpServletResponse response, Model model) {
        bind(model, status);
        response.setStatus(status);
        return "error/error";
    }

    private int resolveStatus(HttpServletRequest request, HttpServletResponse response) {
        Object statusCode = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        if (statusCode instanceof Integer integerStatus) {
            return integerStatus;
        }

        if (statusCode instanceof String stringStatus) {
            try {
                return Integer.parseInt(stringStatus);
            } catch (NumberFormatException ignored) {
                // fallback
            }
        }

        int responseStatus = response.getStatus();
        return responseStatus >= 400 ? responseStatus : HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
    }

    private void bind(Model model, int status) {
        ErrorMeta meta = switch (status) {
            case HttpServletResponse.SC_UNAUTHORIZED -> new ErrorMeta(
                    status,
                    "인증 필요",
                    "로그인 정보가 만료되었거나 인증이 필요합니다",
                    "보안상 일정 시간 동안 활동이 없었거나 인증 정보가 유효하지 않습니다.<br>로그인 후 다시 이용해 주세요.",
                    List.of(
                            "로그인 화면으로 이동해 다시 로그인해 주세요.",
                            "브라우저를 오래 켜둔 뒤 발생했다면 세션 만료 가능성이 있습니다.",
                            "반복되면 관리자에게 발생 시각과 메뉴명을 함께 전달해 주세요."
                    ),
                    "/login",
                    "로그인 화면으로"
            );
            case HttpServletResponse.SC_FORBIDDEN -> new ErrorMeta(
                    status,
                    "접근 제한",
                    "해당 메뉴에 접근할 권한이 없습니다",
                    "인사관리시스템 권한 정책상 요청하신 화면 또는 기능을 사용할 수 없습니다.",
                    List.of(
                            "현재 계정에 필요한 메뉴 권한이 부여되어 있는지 확인해 주세요.",
                            "결재/인사/평가 등 일부 메뉴는 역할별 권한이 있어야 접근할 수 있습니다.",
                            "권한이 필요하면 시스템 관리자 또는 HR 담당자에게 요청해 주세요."
                    ),
                    "/",
                    "메인으로 이동"
            );
            case HttpServletResponse.SC_NOT_FOUND -> new ErrorMeta(
                    status,
                    "페이지 없음",
                    "요청하신 페이지를 찾을 수 없습니다",
                    "주소가 변경되었거나 잘못된 경로로 접속하셨습니다. 메뉴를 통해 다시 접근해 주세요.",
                    List.of(
                            "직접 입력한 주소라면 오탈자가 없는지 확인해 주세요.",
                            "즐겨찾기나 오래된 링크로 접속했다면 최신 메뉴 경로를 이용해 주세요.",
                            "계속 같은 위치에서 발생하면 링크 연결 상태를 점검해 주세요."
                    ),
                    "/",
                    "메인으로 이동"
            );
            case HttpServletResponse.SC_SERVICE_UNAVAILABLE -> new ErrorMeta(
                    status,
                    "서비스 점검",
                    "현재 시스템 점검 또는 서비스 준비 중입니다",
                    "보다 안정적인 인사관리 서비스를 위해 일시적으로 이용이 제한되고 있습니다.",
                    List.of(
                            "잠시 후 다시 접속해 주세요.",
                            "사내 공지 또는 운영 안내를 먼저 확인해 주세요.",
                            "긴급 업무라면 시스템 관리자에게 점검 여부를 문의해 주세요."
                    ),
                    "/login",
                    "로그인 화면으로"
            );
            case HttpServletResponse.SC_INTERNAL_SERVER_ERROR -> new ErrorMeta(
                    status,
                    "시스템 오류",
                    "작업 처리 중 오류가 발생했습니다",
                    "요청은 정상적으로 전달되었지만 서버 내부 처리 중 문제가 발생했습니다.",
                    List.of(
                            "잠시 후 다시 시도해 주세요.",
                            "같은 입력에서 반복되면 입력값과 작업 순서를 함께 기록해 주세요.",
                            "관리자 문의 시 발생 시각, 메뉴명, 작업 내용을 전달해 주세요."
                    ),
                    "/",
                    "메인으로 이동"
            );
            default -> new ErrorMeta(
                    status,
                    "오류 안내",
                    "요청을 처리할 수 없습니다",
                    "예상하지 못한 문제가 발생했습니다. 이전 화면 또는 메인 화면에서 다시 시도해 주세요.",
                    List.of(
                            "입력 중인 내용이 있다면 저장 여부를 다시 확인해 주세요.",
                            "동일 현상이 반복되면 관리자에게 문의해 주세요."
                    ),
                    "/",
                    "메인으로 이동"
            );
        };

        model.addAttribute("statusCode", meta.statusCode());
        model.addAttribute("statusLabel", meta.statusLabel());
        model.addAttribute("title", meta.title());
        model.addAttribute("message", meta.message());
        model.addAttribute("guides", meta.guides());
        model.addAttribute("primaryActionUrl", meta.primaryActionUrl());
        model.addAttribute("primaryActionLabel", meta.primaryActionLabel());
    }

    private record ErrorMeta(
            int statusCode,
            String statusLabel,
            String title,
            String message,
            List<String> guides,
            String primaryActionUrl,
            String primaryActionLabel
    ) {
    }
}
