import SalaryManage from "./manage/SalaryManage";
import SalaryStatements from "./statements/SalaryStatements";

/**
 * 급여 모듈 진입점
 * - Sidebar 상태(activeSubMenu) 기반으로 화면 스위칭
 */
const Salary = ({ activeSubMenu }) => {
    return (
        activeSubMenu === "명세서" ? 
            <SalaryStatements />
        :
            // 기본: 관리
            <SalaryManage />
    );
};

export default Salary;
