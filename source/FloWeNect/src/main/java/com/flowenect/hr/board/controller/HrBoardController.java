package com.flowenect.hr.board.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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
import org.springframework.web.bind.annotation.RequestParam;

import com.flowenect.hr.board.service.BoardService;
import com.flowenect.hr.dto.board.BoardDTO;
import com.flowenect.hr.dto.board.BoardTypeDTO;
import com.flowenect.hr.dto.EmpDTO;
import com.flowenect.hr.security.AuthenticationUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Controller
@RequestMapping("/rest/board")
@RequiredArgsConstructor
public class HrBoardController {

  private final BoardService boardService;

  /**
   * 게시글 등록
   * - 뷰에서 권한 체크 후 작성 버튼을 눌렀을 때 호출.
   *
   * 정책:
   * - 건의(boardTypeNo=6) : 전원 작성 가능
   * - 건의 제외 : HR만 작성 가능
   */
  @PostMapping("/create")
  public ResponseEntity<Integer> create(@RequestBody BoardDTO board, Authentication authentication) {
    log.info("게시글 등록 요청 - 타입: {}, 제목: {}", board.getBoardTypeNo(), board.getTitle());

    // ✅ HR 권한 여부 확인 (ROLE_HR 또는 HR 둘 다 허용)
    boolean isHr = authentication != null
        && authentication.getAuthorities() != null
        && authentication.getAuthorities().stream().anyMatch(a -> {
          String auth = a != null ? a.getAuthority() : "";
          return "ROLE_HR".equals(auth) || "HR".equals(auth);
        });

    int typeNo = board.getBoardTypeNo();

    // ✅ 건의(6) 제외 탭은 HR만 작성 가능
    if (typeNo != 6 && !isHr) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    // ✅ principal 기반 작성자 세팅 (BoardDTO 필드명: regEmpNo)
    if (authentication != null && authentication.isAuthenticated()) {
      EmpDTO u = AuthenticationUtils.getRealUser(authentication);
      if (u != null && u.getEmpNo() != null && !u.getEmpNo().isBlank()) {
        board.setRegEmpNo(u.getEmpNo());
      }
    }

    // 서비스 로직에서 boardTypeNo가 4(교육) 또는 5(채용)이면
    // 자동으로 일정 테이블에 인서트하는 로직이 이미 ServiceImpl에 들어있습니다.
    int postNo = boardService.createBoard(board);

    return ResponseEntity.ok(postNo);
  }

  /**
   * 게시글 수정
   */
  @PutMapping("/update/{postNo}")
  public ResponseEntity<String> modify(@PathVariable int postNo,
                                       @RequestBody BoardDTO board,
                                       Authentication authentication) {
    board.setPostNo(postNo);

    // ✅ 수정자(작성자) 세팅 정책: 보통은 수정자는 별도 컬럼이 없으니 regEmpNo는 "작성자"로 유지가 맞음
    // 만약 "수정자"를 따로 저장하려면 DTO/DB 컬럼을 추가해야 함.
    // 여기서는 기존과 동일하게 principal을 regEmpNo에 덮어쓰지 않는 것이 안전함.
    //
    // 그래도 현재 구조가 "regEmpNo를 작성자/수정자 겸용"으로 쓰는 방식이라면 아래 주석 해제:
    /*
    if (authentication != null && authentication.isAuthenticated()) {
      EmpDTO u = AuthenticationUtils.getRealUser(authentication);
      if (u != null && u.getEmpNo() != null && !u.getEmpNo().isBlank()) {
        board.setRegEmpNo(u.getEmpNo());
      }
    }
    */

    int result = boardService.modifyBoard(board);
    return result == 1 ? ResponseEntity.ok("success") : ResponseEntity.internalServerError().build();
  }

  /**
   * 게시글 삭제
   */
  @DeleteMapping("/delete/{postNo}")
  public ResponseEntity<String> remove(@PathVariable int postNo) {
    int result = boardService.removeBoard(postNo);
    return result == 1 ? ResponseEntity.ok("success") : ResponseEntity.internalServerError().build();
  }

  /**
   * 게시글 목록 조회
   * - 뷰에서 탭을 이동할 때마다 호출하거나, 전체 목록을 가져올 때 사용
   */
  @GetMapping("/readList")
  public ResponseEntity<List<BoardDTO>> getList() {
    return ResponseEntity.ok(boardService.readBoardList());
  }

  /**
   * 게시글 상세 조회
   */
  @GetMapping("/read/{postNo}")
  public ResponseEntity<BoardDTO> getDetail(@PathVariable int postNo) {
    BoardDTO board = boardService.readBoardDetail(postNo);
    return board != null ? ResponseEntity.ok(board) : ResponseEntity.notFound().build();
  }

  /**
   * 게시글 목록 조회 (서버 페이징/검색)
   * - 탭/검색/페이지 이동 시 호출
   */
  @GetMapping("/readPage")
  public ResponseEntity<com.flowenect.hr.dto.board.BoardPageResDTO> readPage(
      @RequestParam int boardTypeNo,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(required = false) String searchType,
      @RequestParam(required = false) String keyword
  ) {
    com.flowenect.hr.dto.board.BoardSearchCondDTO cond = com.flowenect.hr.dto.board.BoardSearchCondDTO.builder()
        .boardTypeNo(boardTypeNo)
        .page(page)
        .size(size)
        .searchType(searchType)
        .keyword(keyword)
        .build();

    return ResponseEntity.ok(boardService.readBoardPage(cond));
  }

  /**
   * 게시판 종류 정보 조회
   */
  @GetMapping("/type/{boardTypeNo}")
  public ResponseEntity<BoardTypeDTO> getBoardType(@PathVariable("boardTypeNo") int boardTypeNo) {
    log.info("Controller - 게시판 종류 조회: {}", boardTypeNo);
    BoardTypeDTO type = boardService.readBoardType(boardTypeNo);

    return type != null ? ResponseEntity.ok(type) : ResponseEntity.notFound().build();
  }
}