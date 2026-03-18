package com.flowenect.hr.commons;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginFormController {

    @GetMapping("/login")
    public String loginForm() {
        return "login";
    }
}
