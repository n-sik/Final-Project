package com.flowenect.hr.board.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 게시판 화면 진입 컨트롤러
 * - 사이드바: /board 로 진입
 */
@Controller
@RequestMapping("/board")
public class BoardViewController {

  @GetMapping
  public String boardForm() {
    return "board/boardFrom";
  }
}
