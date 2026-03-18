package com.flowenect.hr.board.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.flowenect.hr.dto.board.BoardCmntDTO;

import lombok.extern.slf4j.Slf4j;

@SpringBootTest(properties = { "jasypt.encryptor.password=java" })
@Slf4j
@Transactional
class BoardCmntServiceImplTest {

	@Autowired
	private BoardCmntService boardCmntService;
	
	@Test
	void testCreateComment() {
		// Given
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16); // 실제 존재하는 게시글 번호
        cmnt.setCommentLvl(1);
        cmnt.setCommentCn("서비스 계층 등록 테스트");
        cmnt.setWriterEmpNo("2026020213");

        // When
        int generatedNo = boardCmntService.createComment(cmnt);

        // Then
        assertThat(generatedNo).isGreaterThan(0); // 시퀀스 번호가 0보다 커야 함
        log.info("서비스에서 반환된 댓글 번호: {}", generatedNo);
	}

	@Test
	void testReadCommentList() {
		// Given
        int postNo = 16;
        
        // When
        List<BoardCmntDTO> list = boardCmntService.readCommentList(postNo);

        // Then
        // 이전에 등록된 데이터가 있을 것이므로 null이 아니어야 함
        assertThat(list).isNotNull();
        log.info("{}번 게시글의 총 댓글 수: {}", postNo, list.size());
	}

	@Test
	void testModifyComment() {
		// Given (수정할 데이터 먼저 등록)
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16);
        cmnt.setCommentCn("수정 전");
        cmnt.setWriterEmpNo("2026020213");
        int cmntNo = boardCmntService.createComment(cmnt);

        // When
        cmnt.setCmntNo(cmntNo);
        cmnt.setCommentCn("서비스에서 수정한 내용");
        int result = boardCmntService.modifyComment(cmnt);

        // Then
        assertThat(result).isEqualTo(1);
        log.info("수정 완료 여부: {}", result);
	}

	@Test
	void testRemoveComment() {
		// Given (삭제할 데이터 먼저 등록)
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16);
        cmnt.setCommentCn("삭제될 댓글");
        cmnt.setWriterEmpNo("2026020213");
        int cmntNo = boardCmntService.createComment(cmnt);

        // When
        int result = boardCmntService.removeComment(cmntNo);

        // Then
        assertThat(result).isEqualTo(1);
        log.info("삭제 완료 여부: {}", result);
	}

}
