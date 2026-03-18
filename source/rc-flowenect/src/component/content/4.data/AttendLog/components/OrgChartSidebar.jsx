import React, { useState, useEffect } from 'react';
import apiClient from '../../../../../api/apiClient';
import styles from '../AttendLog.module.css';

const OrgChartSidebar = ({ onSelectEmp, activeEmpNo }) => {
  const [depts, setDepts] = useState([]);
  const [empData, setEmpData] = useState({});

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await apiClient.get('api/attendlog/depts');
        setDepts(res.data);
      } catch (err) { console.error(err); }
    };
    fetchDepts();
  }, []);

  const toggleDept = async (deptCd) => {
    if (empData[deptCd]) {
      setEmpData(prev => ({
        ...prev,
        [deptCd]: { ...prev[deptCd], isOpen: !prev[deptCd].isOpen }
      }));
    } else {
      try {
        const res = await apiClient.get(`api/attendlog/depts/${deptCd}/employees`);
        setEmpData(prev => ({
          ...prev,
          [deptCd]: { list: res.data, isOpen: true }
        }));
      } catch (err) { console.error(err); }
    }
  };

  return (
    <nav className={styles.sidebar}>
      <h3>Organization</h3>
      <div>
        {depts.map(dept => (
          <div key={dept.deptCd}>
            <div className={styles.deptItem} onClick={() => toggleDept(dept.deptCd)}>
              {dept.deptNm}
            </div>
            
            {/* 사원 리스트: 열려있을 때만 렌더링 */}
            {empData[dept.deptCd]?.isOpen && (
              <ul className={styles.empList}>
  {empData[dept.deptCd].list.map(emp => (
      <li 
    key={emp.empNo} 
    className={activeEmpNo === emp.empNo ? styles.activeEmp : ''}
    // onClick 부분에 emp.empNm 추가!
    onClick={() => onSelectEmp(emp.empNo, emp.empNm)} 
  >
    <span className={styles.empName}>{emp.empNm} {emp.posNm}</span>
    <span className={styles.empNoBadge}>{emp.empNo}</span>
  </li>
  ))}
</ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};

export default OrgChartSidebar;