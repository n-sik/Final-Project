package com.flowenect.hr.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.flowenect.hr.config.SideBarInterceptor;
import com.flowenect.hr.sidebar.service.SideBarService;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final SideBarService sideBarService;

    public WebMvcConfig(SideBarService sideBarService) {
        this.sideBarService = sideBarService;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new SideBarInterceptor(sideBarService))
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/login",
                        "/login-process",
                        "/logout",
                        "/api/**",
                        "/dist/**",
                        "/js/**",
                        "/css/**",
                        "/images/**",
                        "/fonts/**",
                        "/favicon.ico",
                        "/error",
                        "/error/**"
                );
    }
}