<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<h2>메인 화면</h2>
<p>이 글이 보이면 레이아웃은 정상 동작 중입니다.</p>

<br><br><br><br>
<h1>대중적인 게시판</h1>
<!--=================게시판 1==================  -->
<div class="container mt-5" style="width:55%;">
    <div class="card shadow-sm"> <div class="card-header bg-white py-3">
            <h5 class="m-0 font-weight-bold text-primary">자유게시판</h5>
        </div>
        <div class="card-body">
            <div id="wrapper"></div> <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-primary px-4" >
                    <i class="bi bi-pencil-square"></i> 글쓰기
                </button>
            </div>
        </div>
    </div>
</div>

<br><br><br><br><br>
 <h1>기능이 많다던데 잘 모르겠음</h1>
<!--=================게시판 2==================  -->

<div class="container mt-4" style="width:55%;">
    <div id="example-table"></div> </div>
    
 <br><br><br><br><br>
 <h1>커스텀 편하게 가능</h1>
<!--=================게시판 3==================  -->   
<div id="test-list" class="container mt-5" style="width:55%;">
    <input type="text" class="search form-control mb-3" placeholder="제목이나 작성자 검색..." />

    <div class="mb-2">
        <button class="sort btn btn-outline-secondary btn-sm" data-sort="title">제목순</button>
        <button class="sort btn btn-outline-secondary btn-sm" data-sort="author">작성자순</button>
    </div>

    <table class="table table-hover">
        <thead>
            <tr>
                <th>번호</th>
                <th>제목</th>
                <th>작성자</th>
            </tr>
        </thead>
        <tbody class="list">
            <tr>
                <td class="id">1</td>
                <td class="title">List.js는 진짜 가벼워요</td>
                <td class="author">홍길동</td>
            </tr>
            <tr>
                <td class="id">2</td>
                <td class="title">디자인을 마음대로 할 수 있죠</td>
                <td class="author">이몽룡</td>
            </tr>
        </tbody>
    </table>
</div>

<!-- 풀캘린더 -->
<div id='calendar'></div>
