<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core"%>

<c:set var="deptList" value="${deptList}" scope="request" />

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.org-main-viewport {
  width: 100%;
  height: 100%;
  background: linear-gradient(160deg, #e8f0fe 0%, #f0f4ff 40%, #e8eeff 100%);
  overflow-x: auto;
  overflow-y: auto;
  padding: 3rem 2rem;
  font-family: 'Noto Sans KR', sans-serif;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.tree-branch {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.tree-children {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  flex-wrap: nowrap;
}

.child-container {
  position: relative;
  padding: 0 0.8rem;
  padding-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.child-container::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 2px;
  background: #3b82f6;
  opacity: 0.3;
  z-index: 1;
}
.child-container:first-child::before { left: 50%; width: 50%; }
.child-container:last-child::before  { width: 50%; }
.child-container:only-child::before  { display: none; }

.child-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: calc(50% - 1px);
  width: 2px;
  height: 40px;
  background: #3b82f6;
  opacity: 0.3;
  z-index: 2;
}

.org-main-viewport > .tree-branch > .child-container::after,
.org-main-viewport > .tree-branch > .child-container::before {
  display: none !important;
}
.org-main-viewport > .tree-branch > .child-container {
  padding-top: 0 !important;
}

.v-line-down {
  width: 2px;
  height: 36px;
  background: #3b82f6;
  opacity: 0.3;
  z-index: 2;
}

/* ── 카드 ── */
.dept-node {
  width: 170px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.9);
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(59,130,246,0.08),
    0 8px 24px rgba(59,130,246,0.06),
    inset 0 1px 0 rgba(255,255,255,0.8);
  transition: all 0.25s ease;
}

.dept-node:hover {
  transform: translateY(-4px) scale(1.02);
  background: rgba(255,255,255,0.9);
  border-color: rgba(99,102,241,0.3);
  box-shadow:
    0 8px 24px rgba(99,102,241,0.14),
    0 20px 48px rgba(59,130,246,0.1),
    inset 0 1px 0 rgba(255,255,255,1);
}

.node-header-bar {
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #818cf8, #a78bfa);
}

.node-content {
  padding: 12px 12px 10px;
  text-align: center;
}

.d-title {
  display: block;
  font-size: 13.5px;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.l-badge {
  background: rgba(239,246,255,0.8);
  border: 1px solid rgba(147,197,253,0.5);
  padding: 6px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.l-name {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #2563eb;
}

.l-no {
  display: block;
  font-size: 9.5px;
  color: #93c5fd;
  margin-top: 2px;
}

.d-info {
  border-top: 1px solid rgba(203,213,225,0.5);
  padding-top: 7px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.info-item {
  font-size: 10px;
  color: #94a3b8;
  text-align: center;
}

/* CEO */
.dept-node.is-ceo {
  width: 190px;
  background: rgba(255,255,255,0.85);
  border-color: rgba(99,102,241,0.25);
  box-shadow:
    0 4px 16px rgba(99,102,241,0.12),
    0 12px 40px rgba(59,130,246,0.1),
    inset 0 1px 0 rgba(255,255,255,1);
}
.dept-node.is-ceo .node-header-bar {
  height: 4px;
  background: linear-gradient(90deg, #1d4ed8, #4f46e5, #7c3aed);
}
.dept-node.is-ceo .d-title {
  font-size: 18px;
  color: #312e81;
  letter-spacing: 1px;
}
.dept-node.is-ceo .l-badge {
  background: rgba(238,242,255,0.9);
  border-color: rgba(129,140,248,0.3);
}

/* 등장 애니메이션 */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.dept-node { animation: fadeUp 0.35s ease both; }
.child-container:nth-child(1) .dept-node { animation-delay: 0.04s; }
.child-container:nth-child(2) .dept-node { animation-delay: 0.08s; }
.child-container:nth-child(3) .dept-node { animation-delay: 0.12s; }
.child-container:nth-child(4) .dept-node { animation-delay: 0.16s; }
.child-container:nth-child(5) .dept-node { animation-delay: 0.20s; }
.child-container:nth-child(6) .dept-node { animation-delay: 0.24s; }
.child-container:nth-child(7) .dept-node { animation-delay: 0.28s; }
.child-container:nth-child(8) .dept-node { animation-delay: 0.32s; }
</style>

<div class="org-main-viewport">
  <div class="tree-branch">
    <c:forEach var="root" items="${deptList}">
      <c:if test="${empty root.UP_DEPT_CD || root.UP_DEPT_CD == 'ROOT' || root.UP_DEPT_CD == '0'}">
        <jsp:include page="recursive_node.jsp">
          <jsp:param name="p_id"    value="${root.DEPT_CD}" />
          <jsp:param name="p_nm"    value="${root.DEPT_NM}" />
          <jsp:param name="p_ld_no" value="${root.DEPT_HEAD_EMP_NO}" />
          <jsp:param name="p_ld_nm" value="${root.DEPT_HEAD_NM}" />
          <jsp:param name="p_tel"   value="${root.DEPT_TEL}" />
          <jsp:param name="p_loc"   value="${root.DEPT_LOC}" />
        </jsp:include>
      </c:if>
    </c:forEach>
  </div>
</div>