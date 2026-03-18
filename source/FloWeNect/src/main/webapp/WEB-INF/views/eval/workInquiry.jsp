<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>

<link rel="stylesheet" href="/css/common/aggridCustom.css">
<link rel="stylesheet" href="/css/common/header.css">
<link rel="stylesheet" href="/css/eval/workInquiry.css">

<div class="work-management-wrapper">

	<%-- ① 공통 페이지 헤더 --%>
	<header class="c-page-header">
		<div class="c-page-header__left">
			<h1 class="c-page-header__title">업무조회</h1>
			<p class="c-page-header__sub">평가/조회 · 업무조회</p>
		</div>
		<div class="c-page-header__right">
			<%-- 검색 인풋들 --%>
			<div class="wi-search-group">
				<span class="wi-search-label">조회 기간</span>
				<div class="wi-date-group">
					<input type="date" id="startDate" class="wi-date-input" onclick="this.showPicker()">
					<span class="wi-date-sep">~</span>
					<input type="date" id="endDate"   class="wi-date-input" onclick="this.showPicker()">
				</div>
			</div>
			<div class="wi-search-group">
				<span class="wi-search-label">업무명</span>
				<input type="text" id="searchKeyword" class="wi-keyword-input" placeholder="검색어를 입력하세요" autocomplete="off">
			</div>
			<button type="button" onclick="WorkApp.onSearch()" class="c-btn c-btn--primary">
				<i class="fas fa-search"></i> 조회
			</button>
		</div>
	</header>

	<%-- ② 하단 컨텐츠 --%>
	<div class="work-bottom-layout">
		<aside class="side-nav-panel">
			<div id="deptEmpGrid" class="ag-theme-quartz manager-view-grid"></div>
		</aside>

		<main class="main-work-panel">
			<section id="workContentRoot" class="work-content-root"></section>
		</main>
	</div>
</div>

<script src="/js/eval/workInquiry.js"></script>
