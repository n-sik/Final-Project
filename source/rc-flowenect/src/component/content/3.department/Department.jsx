import React from 'react';
import { FileText } from 'lucide-react';
import clsx from "clsx";

import contentSty from "../Content.module.css";
import ProjectManagement from "./ProjectManagement";
import DeptManagement from './DeptManagement';

const Department = ({ activeSubMenu }) => {
  if (activeSubMenu === '프로젝트 관리') {
    return <ProjectManagement />;
  }

  if (activeSubMenu === '관리') {
    return <DeptManagement />;
  }

  // 아직 구현되지 않은 메뉴는 기존 공통 Empty UI로 처리
  return (
    <div className={clsx(contentSty.contentCard)}>
      <div className={clsx(contentSty.cardHeader)}>
        <h3>{activeSubMenu}</h3>
      </div>
      <div className={clsx(contentSty.emptyState)}>
        <FileText size={48} />
        <p>준비 중입니다</p>
      </div>
    </div>
  );
};

export default Department;