package com.flowenect.hr.board.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.flowenect.hr.board.service.BoardCmntService;
import com.flowenect.hr.dto.board.BoardCmntDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.AuthenticationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@Slf4j
@RequestMapping("/rest/board/comment")
@RequiredArgsConstructor
public class BoardCmntController {

  private final BoardCmntService boardCmntService;

  /**
   * 댓글 등록
   */
  @PostMapping("/create")
  public ResponseEntity<Integer> registerComment(@RequestBody BoardCmntDTO boardCmnt,
                                                 Authentication authentication) {
    log.info("Controller - 댓글 등록 요청: {}", boardCmnt);

    // ✅ principal 기반 작성자 세팅 (DTO 필드명: writerEmpNo)
    if (authentication != null && authentication.isAuthenticated()) {
      EmpDTO u = AuthenticationUtils.getRealUser(authentication);
      if (u != null && u.getEmpNo() != null && !u.getEmpNo().isBlank()) {
        boardCmnt.setWriterEmpNo(u.getEmpNo());
      }
    }

    int cmntNo = boardCmntService.createComment(boardCmnt);
    return ResponseEntity.ok(cmntNo);
  }

  /**
   * 특정 게시글의 댓글 목록 조회
   */
  @GetMapping("/readList/{postNo}")
  public ResponseEntity<List<BoardCmntDTO>> getCommentList(@PathVariable("postNo") int postNo) {
    log.info("Controller - 댓글 목록 조회 요청 (PostNo: {})", postNo);
    List<BoardCmntDTO> list = boardCmntService.readCommentList(postNo);
    return ResponseEntity.ok(list);
  }

  /**
   * 댓글 수정
   */
  @PutMapping("/modify")
  public ResponseEntity<String> modifyComment(@RequestBody BoardCmntDTO boardCmnt,
                                              Authentication authentication) {
    log.info("Controller - 댓글 수정 요청: {}", boardCmnt);

    // (선택) 보안 강화: 수정 요청자 = 작성자 검증을 서비스에서 하거나 여기서 추가 가능
    // principal로 writerEmpNo를 덮어씌우고 싶다면 아래처럼 가능:
    // EmpDTO u = AuthenticationUtils.getRealUser(authentication);
    // boardCmnt.setWriterEmpNo(u.getEmpNo());

    int result = boardCmntService.modifyComment(boardCmnt);
    return result > 0 ? ResponseEntity.ok("Success") : ResponseEntity.badRequest().body("Fail");
  }

  /**
   * 댓글 삭제
   */
  @DeleteMapping("/remove/{cmntNo}")
  public ResponseEntity<String> removeComment(@PathVariable("cmntNo") int cmntNo) {
    log.info("Controller - 댓글 삭제 요청 (CmntNo: {})", cmntNo);
    int result = boardCmntService.removeComment(cmntNo);
    return result > 0 ? ResponseEntity.ok("Success") : ResponseEntity.badRequest().body("Fail");
  }
}