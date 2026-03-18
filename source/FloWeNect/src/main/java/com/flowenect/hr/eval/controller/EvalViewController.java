package com.flowenect.hr.eval.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/leader")
public class EvalViewController {

	@GetMapping("/qual/eval/readList")
	public String qualEvalForm() {
		return "eval/qualEval";
	}

	@GetMapping("/quant/eval/readList")
	public String quantEvalForm() {
		return "eval/quantEval";
	}

	@GetMapping("/work/readList")
	public String workForm() {
		return "eval/workInquiry";
	}
}