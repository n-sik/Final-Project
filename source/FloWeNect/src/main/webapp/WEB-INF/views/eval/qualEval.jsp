<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>

<link rel="stylesheet" href="/css/common/aggridCustom.css">
<link rel="stylesheet" href="/css/common/header.css">
<link rel="stylesheet" href="/css/eval/qualEval.css">
<style>



</style>
<div class="qual-eval-layout">
    <header class="c-page-header">
        <div class="c-page-header__left">
            <h1 class="c-page-header__title">정성평가</h1>
            <p class="c-page-header__sub">평가/조회 · 정성평가</p>
        </div>
        <div class="c-page-header__right"></div>
    </header>

    <div class="qual-content-wrapper">
        <aside class="qual-sidebar">
            <div id="deptWorkGrid" class="ag-theme-quartz manager-view-grid" style="height: 100%;"></div>
        </aside>

        <main class="qual-main-content">
            <div class="qual-header">
                <h3 class="qual-title">
                    평가 대상 : <span id="targetDisplay">대상자를 선택해주세요</span>
                </h3>
            </div>
            <div id="qualEvalContainer" class="qual-eval-body"></div>
            <div id="navActionArea" class="nav-area"></div>
        </main>
    </div>
</div>

<script src="/js/eval/qualEval.js"></script>