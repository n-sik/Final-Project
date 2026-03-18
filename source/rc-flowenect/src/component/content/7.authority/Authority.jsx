import React from "react";
import clsx from "clsx";
import { FileText } from "lucide-react";

import styled from "./Authority.module.css";

import AuthorityManage from "./manage/AuthorityManage";

/**
 * 권한관리 메뉴 진입점
 * - Sidebar(activeSubMenu)에 따라 화면 스위칭
 */
const Authority = ({ activeSubMenu }) => {
  if (activeSubMenu === "관리") {
    return <AuthorityManage />;
  }

  return (
    <div className={clsx(styled.contentCard)}>
      <div className={clsx(styled.cardHeader)}>
        <div className={styled.title}>{activeSubMenu}</div>
        <div className={styled.subTitle}>준비 중입니다</div>
      </div>
      <div className={clsx(styled.emptyState)}>
        <FileText size={48} />
        <p>해당 화면은 추후 구현 예정입니다.</p>
      </div>
    </div>
  );
};

export default Authority;
