import AttendanceManagement from "./AttendanceManagement";
import Annual from "./Annual";

const Attendance = ({ activeSubMenu }) => {
  // 여기서 서브메뉴에 따라 어떤 페이지를 보여줄지 결정합니다.
  if (activeSubMenu === "출퇴현황") {
    return <AttendanceManagement />;
  }

  if (activeSubMenu === "연차관리") {
    return <Annual />;
  }

  return <div>준비 중입니다.</div>;
};

export default Attendance;
