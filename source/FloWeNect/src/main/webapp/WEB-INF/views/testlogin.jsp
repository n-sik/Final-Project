<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="jakarta.tags.core" prefix="c"%>

<%-- 사이트메쉬가 <head> 내용은 자동으로 합쳐주므로, 타이틀만 정의해줍니다 --%>
<head>
    <title>로그인 - 인사관리 시스템</title>
</head>

<%-- 실제 <body> 안에 들어갈 내용만 작성합니다 --%>
<div class="login-container">
    <h2>인사관리 시스템 로그인</h2>
    
    <c:if test="${param.error == 'true'}">
        <div class="alert alert-danger" style="color:red; margin-bottom: 15px;">
            아이디 또는 비밀번호가 틀렸습니다.
        </div>
    </c:if>

    <form action="/auth/login" method="post">
        <div class="form-group">
            <label>아이디</label>
            <input type="text" name="loginId" class="form-control" placeholder="아이디를 입력하세요" required>
        </div>
        <div class="form-group" style="margin-top: 10px;">
            <label>비밀번호</label>
            <input type="password" name="password" class="form-control" placeholder="비밀번호를 입력하세요" required>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top: 20px; width: 100%;">로그인</button>
    </form>
</div>