<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>

<c:set var="curId"   value="${param.p_id}" />
<c:set var="curNm"   value="${param.p_nm}" />
<c:set var="curLdNo" value="${param.p_ld_no}" />
<c:set var="curLdNm" value="${param.p_ld_nm}" />
<c:set var="curTel"  value="${param.p_tel}" />
<c:set var="curLoc"  value="${param.p_loc}" />

<c:set var="isRoot" value="false" />
<c:forEach var="d" items="${deptList}">
  <c:if test="${d.DEPT_CD eq curId and (empty d.UP_DEPT_CD or d.UP_DEPT_CD eq 'ROOT' or d.UP_DEPT_CD eq '0')}">
    <c:set var="isRoot" value="true" />
  </c:if>
</c:forEach>

<div class="tree-branch child-container">
  <div class="dept-node ${isRoot ? 'is-ceo' : ''}">
    <div class="node-header-bar"></div>
    <div class="node-content">
      <span class="d-title">${curNm}</span>
      <div class="l-badge">
        <span class="l-name">${not empty curLdNm ? curLdNm : '공석'}</span>
        <c:if test="${not empty curLdNo}">
          <span class="l-no">${curLdNo}</span>
        </c:if>
      </div>
      <div class="d-info">
        <span class="info-item">
          <span class="dot"></span>
          ${not empty curTel ? curTel : '-'}
        </span>
        <span class="info-item">
          <span class="dot"></span>
          ${not empty curLoc ? curLoc : '-'}
        </span>
      </div>
    </div>
  </div>

  <c:set var="hasChild" value="false" />
  <c:forEach var="chk" items="${deptList}">
    <c:if test="${chk.UP_DEPT_CD eq curId}">
      <c:set var="hasChild" value="true" />
    </c:if>
  </c:forEach>

  <c:if test="${hasChild}">
    <div class="v-line-down"></div>
    <div class="tree-children">
      <c:forEach var="child" items="${deptList}">
        <c:if test="${child.UP_DEPT_CD eq curId}">
          <jsp:include page="recursive_node.jsp">
            <jsp:param name="p_id"    value="${child.DEPT_CD}" />
            <jsp:param name="p_nm"    value="${child.DEPT_NM}" />
            <jsp:param name="p_ld_no" value="${child.DEPT_HEAD_EMP_NO}" />
            <jsp:param name="p_ld_nm" value="${child.DEPT_HEAD_NM}" />
            <jsp:param name="p_tel"   value="${child.DEPT_TEL}" />
            <jsp:param name="p_loc"   value="${child.DEPT_LOC}" />
          </jsp:include>
        </c:if>
      </c:forEach>
    </div>
  </c:if>
</div>