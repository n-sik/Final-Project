import React from "react";
import clsx from "clsx";
import { FileText } from "lucide-react";

import AccessLog from "./accesslog/AccessLog";
import PayHistory from "./history/pay/PayHistory";
import WorkforceHistory from "./history/workforce/WorkforceHistory";
import AprvHistory from "./history/aprv/AprvHistory";
import styled from "./Record.module.css";

/**
 * 이력 메뉴 진입점
 * - Sidebar(activeSubMenu)에 따라 화면 스위칭
 */
const Record = ({ activeSubMenu }) => {
  if (activeSubMenu === "로그조회") {
    return <AccessLog />;
  }

  if (activeSubMenu === "급여관리이력") {
    return <PayHistory />;
  }

  if (activeSubMenu === "인력관리이력") {
    return <WorkforceHistory />;
  }

  if (activeSubMenu === "전자결재이력") {
    return <AprvHistory />;
  }

  // 예외: 메뉴명이 예상과 다를 때 fallback
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

export default Record;
