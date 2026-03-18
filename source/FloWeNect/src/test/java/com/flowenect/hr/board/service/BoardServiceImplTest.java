package com.flowenect.hr.board.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.board.BoardDTO;
import com.flowenect.hr.dto.board.BoardTypeDTO;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Slf4j
@Transactional
class BoardServiceImplTest {

	@Autowired
    private BoardService boardService;
	
	@Test
	void testCreateBoard() {
		// 1. Given
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1); // 공지
        board.setRegEmpNo("2026020213"); // 실제 존재하는 사번
        board.setTitle("서비스 테스트 제목");
        board.setCn("서비스 테스트 내용");
        board.setPeriodYn("N");

        // 2. When
        int generatedPostNo = boardService.createBoard(board);

        // 3. Then
        assertThat(generatedPostNo).isGreaterThan(0);
        
        BoardDTO foundBoard = boardService.readBoardDetail(generatedPostNo);
        assertThat(foundBoard.getTitle()).isEqualTo("서비스 테스트 제목");
        System.out.println("등록된 게시글 번호: " + generatedPostNo);
	}

	@Test
	void testModifyBoard() {
		// 1. Given: 수정을 위해 글을 먼저 하나 등록함
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1);
        board.setRegEmpNo("2026020213"); // 실제 DB에 있는 사번
        board.setTitle("수정 전 제목");
        board.setCn("수정 전 내용");
        int postNo = boardService.createBoard(board);

        // 2. When: 등록된 글을 가져와서 내용을 수정함
        BoardDTO updateDTO = boardService.readBoardDetail(postNo);
        updateDTO.setTitle("수정 완료된 제목");
        updateDTO.setCn("내용도 수정되었습니다.");
        
        int result = boardService.modifyBoard(updateDTO);

        // 3. Then: 수정 결과 확인
        assertThat(result).isEqualTo(1); // 1행이 수정되었는지 확인
        
        BoardDTO updatedBoard = boardService.readBoardDetail(postNo);
        assertThat(updatedBoard.getTitle()).isEqualTo("수정 완료된 제목");
        assertThat(updatedBoard.getCn()).contains("수정되었습니다");
	}

	@Test
	void testRemoveBoard() {
		// 1. Given
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1);
        board.setRegEmpNo("2026020213");
        board.setTitle("삭제용 게시글");
        int postNo = boardService.createBoard(board);

        // 2. When
        boardService.removeBoard(postNo);

        // 3. Then: 상세 조회 시 데이터가 나오지 않아야 함 (DEL_YN='N' 조건 때문)
        BoardDTO result = boardService.readBoardDetail(postNo);
        assertThat(result).isNull();
	}

	@Test
	void testReadBoardDetail() {
		// 1. Given: 조회를 위해 글을 먼저 등록함
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1);
        board.setRegEmpNo("2026020213");
        board.setTitle("상세보기 테스트");
        board.setCn("상세보기 본문입니다.");
        int postNo = boardService.createBoard(board);

        // 2. When: 서비스 메서드 호출
        BoardDTO foundBoard = boardService.readBoardDetail(postNo);

        // 3. Then: 값이 정확한지 검증
        assertThat(foundBoard).isNotNull();
        assertThat(foundBoard.getPostNo()).isEqualTo(postNo);
        assertThat(foundBoard.getTitle()).isEqualTo("상세보기 테스트");
	}

	@Test
	void testReadBoardList() {
		// 1. Given: 목록에 나올 데이터가 최소 한 개는 있도록 보장 (선택사항)
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1);
        board.setRegEmpNo("2026020213");
        board.setTitle("목록 테스트용 글");
        boardService.createBoard(board);

        // 2. When: 목록 조회 실행
        List<BoardDTO> boardList = boardService.readBoardList();

        // 3. Then: 리스트가 null이 아니고 최소 1개 이상 들어있는지 확인
        assertThat(boardList).isNotNull();
        assertThat(boardList.size()).isGreaterThanOrEqualTo(1);
        
        System.out.println("조회된 게시글 수: " + boardList.size());
	}

	@Test
	void testReadBoardType() {
		// 1. Given: 아까 DB에 넣은 4번(교육) 기준
        int typeNo = 4;

        // 2. When
        BoardTypeDTO type = boardService.readBoardType(typeNo);

        // 3. Then
        assertThat(type).isNotNull();
        assertThat(type.getBoardTypeNm()).isEqualTo("교육");
        System.out.println("조회된 게시판 타입명: " + type.getBoardTypeNm());
	}

}
