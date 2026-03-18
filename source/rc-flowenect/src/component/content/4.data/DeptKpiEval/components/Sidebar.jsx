import React from 'react';
import { LayoutDashboard, Building2, ChevronRight } from 'lucide-react';
import styles from '../DeptKpiEval.module.css';

const Sidebar = ({ depts, selectedDept, onDeptClick }) => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <LayoutDashboard size={22} color="#3b82f6" />
        <span className={styles.logoText}>KPI 분석시스템</span>
      </div>
      <nav className={styles.navSection}>
        <p className={styles.navLabel}>조직 목록</p>
        {depts.map((d) => (
          <button
            key={d.deptCd}
            className={`${styles.deptButton} ${selectedDept === d.deptCd ? styles.activeButton : ''}`}
            onClick={() => onDeptClick(d.deptCd)}
          >
            <div className={styles.deptIconGroup}>
              <Building2 size={18} />
              <span>{d.deptNm}</span>
            </div>
            {selectedDept === d.deptCd && <ChevronRight size={16} />}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;