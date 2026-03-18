package com.flowenect.hr.board.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.log;

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
class BoardCmntMapperTest {

	@Autowired
	private BoardCmntMapper boardCmntMapper;
	
	@Test
	void testInsertComment() {
		// Given
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16);               // 실제 존재하는 게시글 번호 가정
        cmnt.setCommentLvl(1);           // 일반 댓글
        cmnt.setCommentCn("댓글 등록 테스트입니다.");
        cmnt.setWriterEmpNo("2026020213");  // 실제 존재하는 사원 번호 가정

        // When
        int result = boardCmntMapper.insertComment(cmnt);

        // Then
        assertThat(result).isEqualTo(1);
        log.info("등록된 댓글 번호: {}", cmnt.getCmntNo());
	}

	@Test
	void testSelectCommentList() {
		// Given (테스트용 댓글 하나 미리 등록)
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16);
        cmnt.setCommentLvl(1);
        cmnt.setCommentCn("목록 조회용 댓글");
        cmnt.setWriterEmpNo("2026020213");
        boardCmntMapper.insertComment(cmnt);

        // When
        List<BoardCmntDTO> list = boardCmntMapper.selectCommentList(16);

        // Then
        assertThat(list).isNotEmpty();
        log.info("조회된 댓글 수: {}", list.size());
        list.forEach(item -> log.info("댓글 내용: {}", item.getCommentCn()));
	}

	@Test
	void testUpdateComment() {
		// Given (수정할 댓글 등록)
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16);
        cmnt.setCommentCn("수정 전 내용");
        cmnt.setWriterEmpNo("2026020213");
        boardCmntMapper.insertComment(cmnt);

        // When
        cmnt.setCommentCn("수정 후 내용입니다.");
        int result = boardCmntMapper.updateComment(cmnt);

        // Then
        assertThat(result).isEqualTo(1);
        log.info("수정 결과: {}", result);
	}

	@Test
	void testDeleteComment() {
		// Given (삭제할 댓글 등록)
        BoardCmntDTO cmnt = new BoardCmntDTO();
        cmnt.setPostNo(16);
        cmnt.setCommentCn("삭제될 댓글");
        cmnt.setWriterEmpNo("2026020213");
        boardCmntMapper.insertComment(cmnt);
        int targetCmntNo = cmnt.getCmntNo();

        // When
        int result = boardCmntMapper.deleteComment(targetCmntNo);

        // Then
        assertThat(result).isEqualTo(1);
        log.info("삭제(DEL_YN='Y') 처리 완료: {}", targetCmntNo);
	}

}
