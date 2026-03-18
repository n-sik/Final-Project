import { FileText } from "lucide-react";
import styled from "./Workforce.module.css";
import clsx from "clsx";
import InsaMove from "./InsaMove";
import Registration from "./Registration";
import Resign from "./Resign";

const Workforce = ({ activeSubMenu }) => {
  console.log("현재 메뉴 값:", activeSubMenu);
  // activeSubMenu에 따라 다른 컴포넌트 렌더링
  const renderContent = () => {
    switch (activeSubMenu?.trim()) {
      case "사원목록":
        return <Registration />;

      case "인사이동":
        return <InsaMove />;

      case "퇴사관리":
        return <Resign />;
      //
      // 다른 서브메뉴들도 여기 추가

      default:
        return (
          <div className={clsx(styled.contentCard)}>
            <div className={clsx(styled.cardHeader)}>
              <h3>{activeSubMenu}</h3>
            </div>
            <div className={clsx(styled.emptyState)}>
              <FileText size={48} />
              <p>준비 중입니다</p>
            </div>
          </div>
        );
    }
  };

  return(
    renderContent()
  );
};

export default Workforce;