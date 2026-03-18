package com.flowenect.hr.config;

import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import com.flowenect.hr.emp.mapper.EmpMapper;
import com.flowenect.hr.security.listener.AccessLogSessionListener;

import jakarta.servlet.http.HttpSessionListener;

@Configuration
public class AccessLogListenerConfig {

    @Bean
    public ServletListenerRegistrationBean<HttpSessionListener> accessLogSessionListener(@Lazy EmpMapper empMapper) {
        ServletListenerRegistrationBean<HttpSessionListener> bean = new ServletListenerRegistrationBean<>();
        bean.setListener(new AccessLogSessionListener(empMapper));
        bean.setOrder(1);
        return bean;
    }
}
