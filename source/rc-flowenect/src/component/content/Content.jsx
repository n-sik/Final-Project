import { Navigate, Route, Routes } from 'react-router-dom';

import Workforce from './1.workforce/Workforce';
import Salary from './2.salary/Salary';
import Department from './3.department/Department';
import Data from './4.data/Data';
import Attendance from './5.attendance/Attendance';
import Record from './6.record/Record';
import Authority from './7.authority/Authority';
import { defaultRoute, flatMenuList } from '../sidebar/menuConfig';

const routeComponentMap = {
  인력: Workforce,
  급여: Salary,
  부서: Department,
  데이터: Data,
  근태: Attendance,
  이력: Record,
  권한: Authority,
};

const Content = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultRoute} replace />} />

      {flatMenuList.map(({ menuName, submenuName, path }) => {
        const PageComponent = routeComponentMap[menuName];

        return (
          <Route
            key={path}
            path={path}
            element={<PageComponent activeSubMenu={submenuName} />}
          />
        );
      })}

      <Route path="*" element={<Navigate to={defaultRoute} replace />} />
    </Routes>
  );
};

export default Content;
