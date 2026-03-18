package com.flowenect.hr.board.mapper;

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
class BoardMapperTest {

	@Autowired
    private BoardMapper boardMapper;
	
	@Test
	void testInsertBoard() {
		// 1. Given: 테스트 데이터 준비
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1); // 공지사항 혹은 교육 게시판 번호
        board.setRegEmpNo("2026020213");
        board.setTitle("테스트 제목입니다.");
        board.setCn("테스트 내용입니다.");
        board.setPeriodYn("N");
        board.setViewCnt(0);

        // 2. When: 등록 실행
        int result = boardMapper.insertBoard(board);

        // 3. Then: 검증
        assertThat(result).isEqualTo(1); // 1행 삽입 확인
        assertThat(board.getPostNo()).isNotNull(); // useGeneratedKeys로 postNo가 채워졌는지 확인
        System.out.println("생성된 게시글 번호: " + board.getPostNo());
	}

	@Test
	void testUpdateBoard() {
		// 1. Given: 원본 데이터 등록
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1);
        board.setRegEmpNo("실제사번");
        board.setTitle("수정 전 제목");
        boardMapper.insertBoard(board);

        // 2. When: 데이터 수정 후 업데이트
        board.setTitle("수정 후 제목");
        board.setCn("수정된 내용입니다.");
        int updateResult = boardMapper.updateBoard(board);

        // 3. Then: 업데이트 결과 및 실제 반영 확인
        assertThat(updateResult).isEqualTo(1);
        BoardDTO updatedBoard = boardMapper.selectBoardDetail(board.getPostNo());
        assertThat(updatedBoard.getTitle()).isEqualTo("수정 후 제목");
	}

	@Test
	void testDeleteBoard() {
		// 1. Given: 삭제할 데이터 등록
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1);
        board.setRegEmpNo("2026020213");
        board.setTitle("삭제될 제목");
        boardMapper.insertBoard(board);
        int postNo = board.getPostNo();

        // 2. When: 삭제 실행 (DEL_YN = 'Y' 업데이트)
        int deleteResult = boardMapper.deleteBoard(postNo);

        // 3. Then: 삭제 결과 확인 및 조회 시 NULL 반환 확인
        assertThat(deleteResult).isEqualTo(1);
        
        // selectBoardDetail 쿼리에 WHERE DEL_YN = 'N'이 걸려있으므로 NULL이 와야 정상
        BoardDTO deletedBoard = boardMapper.selectBoardDetail(postNo);
        assertThat(deletedBoard).isNull();
	}

	@Test
	void testSelectBoardList() {
		// 1. When: 목록 조회 실행
        List<BoardDTO> list = boardMapper.selectBoardList();

        // 2. Then: 리스트가 비어있지 않은지 확인
        assertThat(list).isNotNull();
        System.out.println("현재 게시글 총 개수: " + list.size());
	}

	@Test
	void testSelectBoardDetail() {
		// 1. Given: 조회를 위한 데이터 등록 (앞서 성공한 insert 로직 활용)
        BoardDTO board = new BoardDTO();
        board.setBoardTypeNo(1); // 공지
        board.setRegEmpNo("2026020213"); // DB에 있는 사번 입력
        board.setTitle("상세 조회 테스트 제목");
        board.setCn("상세 조회 테스트 내용");
        boardMapper.insertBoard(board);
        int generatedPostNo = board.getPostNo();

        // 2. When: 상세 조회 실행
        BoardDTO foundBoard = boardMapper.selectBoardDetail(generatedPostNo);

        // 3. Then: 데이터 검증
        assertThat(foundBoard).isNotNull();
        assertThat(foundBoard.getTitle()).isEqualTo("상세 조회 테스트 제목");
        assertThat(foundBoard.getCn()).isEqualTo("상세 조회 테스트 내용");
	}

	@Test
	void testSelectBoardType() {
		// 1. Given: 우리가 아까 DB에 넣은 4번(교육) 데이터를 기준으로 테스트
	    int boardTypeNo = 4;

	    // 2. When: 매퍼 메서드 호출
	    BoardTypeDTO typeInfo = boardMapper.selectBoardType(boardTypeNo);

	    // 3. Then: 데이터가 정확한지 검증
	    assertThat(typeInfo).isNotNull();
	    assertThat(typeInfo.getBoardTypeNm()).contains("교육"); // 이름에 '교육'이 들어있는지 확인
	    assertThat(typeInfo.getUseYn()).isEqualTo("Y");       // 사용 중인 타입인지 확인
	    
	    System.out.println("조회된 타입명: " + typeInfo.getBoardTypeNm());
	}

}
