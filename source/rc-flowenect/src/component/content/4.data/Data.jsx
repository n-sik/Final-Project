import React from "react";
import { FileText } from "lucide-react";

import ProjectPerformance from "../4.data/ProjectPerformance/ProjectPerformance";
import WorkforceDist from "../4.data/WorkforceDist/WorkforceDist";
import AttendanceTable from "../4.data/AttendLog/AttendLog";
import ResignStatus from "../4.data/ResignStatus/ResignStatus";
import IndividualEval from "../4.data/IndividualEval/IndividualEval";
import KpiStatus from "../4.data/DeptKpiEval/DeptKpiEval";

const Data = ({ activeSubMenu }) => {
  const menu = activeSubMenu?.trim();

  const renderContent = () => {
    switch (menu) {
      case "프로젝트 수행 현황":
        return <ProjectPerformance activeSubMenu={menu} />;
      case "인력분포도":
        return <WorkforceDist activeSubMenu={menu} />;
      case "근태표":
        return <AttendanceTable activeSubMenu={menu} />;
      case "퇴직현황":
        return <ResignStatus activeSubMenu={menu} />;
      case "개인 종합 평가":
        return <IndividualEval activeSubMenu={menu} />;
      case "부서별 평가(KPI)":
        return <KpiStatus activeSubMenu={menu} />;

      default:
        return (
          <div className="p-10 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-3xl shadow-sm border border-dashed border-slate-300">
            <div className="mb-4 text-slate-300">
              <FileText size={64} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {menu || "메뉴를 선택해주세요"}
            </h3>
            <p className="text-slate-500">
              {menu 
                ? `${menu} 데이터를 불러오는 중입니다...` 
                : "좌측 사이드바에서 상세 메뉴를 선택해 주세요."}
            </p>
          </div>
        );
    }
  };

  return (
      renderContent()
  );
};

export default Data;