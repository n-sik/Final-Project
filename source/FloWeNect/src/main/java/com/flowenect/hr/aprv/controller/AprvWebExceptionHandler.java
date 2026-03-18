package com.flowenect.hr.aprv.controller;

import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;

@ControllerAdvice
public class AprvWebExceptionHandler {

    @ExceptionHandler({ IllegalStateException.class, IllegalArgumentException.class })
    public String handleRuntime(RuntimeException e, HttpServletRequest req, RedirectAttributes ra) {

        ra.addFlashAttribute("err", e.getMessage());

        String referer = req.getHeader("Referer");
        if (referer == null || referer.isBlank()) {
            return "redirect:/aprv/readList";
        }
        return "redirect:" + referer;
    }
}