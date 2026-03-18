<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link rel="stylesheet" href="/css/common/aggridCustom.css">
<link rel="stylesheet" href="/css/common/header.css">
<link rel="stylesheet" href="/css/eval/quantEval.css">

<div class="quant-eval-layout">
	<header class="c-page-header">
		<div class="c-page-header__left">
			<h1 class="c-page-header__title">정량평가</h1>
			<p class="c-page-header__sub">평가/조회 · 정량평가</p>
		</div>

		<div class="c-page-header__right">
			<span id="aiLoadingSpinner"
				style="display: none; align-items: center; gap: 8px; color: #4f46e5; font-size: 0.9rem; font-weight: 600;">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none"
					stroke="#4f46e5" stroke-width="2.5" stroke-linecap="round"
					style="animation: spin 0.8s linear infinite;">
            <path
						d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg> 분석 중...
			</span>
			<button type="button" class="c-btn c-btn--primary" id="btnAiAction"
				onclick="QuantApp.runAiAnalysis()">AI 평가하기</button>
		</div>
	</header>

	<div class="quant-body-container">
		<aside class="quant-sidebar">
			<div id="quantTargetGrid" class="ag-theme-quartz manager-view-grid"></div>
		</aside>

		<main class="quant-main-content">
			<div id="quantDashboard" class="quant-dashboard"></div>
		</main>
	</div>
</div>

<script src="/js/eval/quantEval.js"></script>