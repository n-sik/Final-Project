package com.flowenect.hr.config;

import java.util.List;

import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.dto.sidebar.MenuDTO;
import com.flowenect.hr.security.AuthenticationUtils;
import com.flowenect.hr.sidebar.service.SideBarService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class SideBarInterceptor implements HandlerInterceptor {

    private final SideBarService sideBarService;

    public SideBarInterceptor(SideBarService sideBarService) {
        this.sideBarService = sideBarService;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response,
                           Object handler, ModelAndView modelAndView) throws Exception {

        if (modelAndView == null || modelAndView.getViewName() == null) return;
        if (modelAndView.getViewName().startsWith("redirect:")) return;

        if ("XMLHttpRequest".equals(request.getHeader("X-Requested-With"))) return;
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken || !authentication.isAuthenticated()) {
            return;
        }

        EmpDTO loginUser;
        try {
            loginUser = AuthenticationUtils.getRealUser(authentication);
        } catch (Exception e) {
            return;
        }
        if (loginUser == null || loginUser.getEmpNo() == null || loginUser.getEmpNo().isBlank()) {
            return;
        }

        List<MenuDTO> menuList = sideBarService.getMenuList(loginUser.getEmpNo());
        modelAndView.addObject("menuList", menuList);
    }
}
