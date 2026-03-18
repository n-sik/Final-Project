import React from 'react';
import styles from '../WorkforceDist.module.css';

const WorkforceFilterBar = ({ 
  searchTerm, setSearchTerm, 
  selectedPos, setSelectedPos, 
  selectedStat, setSelectedStat, 
  selectedDept, setSelectedDept, // 부서 필터 추가
  hireYear, setHireYear,         // 입사년도 필터 추가
  employees, onReset, onExcelDownload
}) => {
  // 데이터 기반 자동 리스트 생성
  const posList = ["ALL", ...new Set(employees.map(e => e.posNm).filter(Boolean))];
  const statList = ["ALL", ...new Set(employees.map(e => e.empStatNm).filter(Boolean))];
  const deptList = ["ALL", ...new Set(employees.map(e => e.deptNm).filter(Boolean))];
  
  // 입사년도 추출 (예: 2024-01-01 -> 2024)
  const yearList = ["ALL", ...new Set(employees.map(e => e.hireDt?.substring(0, 4)).filter(Boolean))].sort((a, b) => b - a);

  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.sidebarTitle}>인력 분석 필터</h2>
      
      {/* 1. 통합 검색 (기존 유지) */}
      <div className={styles.filterGroup}>
        <label>통합 검색</label>
        <input 
          className={styles.input}
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          placeholder="성명 또는 사번 입력" 
        />
      </div>

      {/* 2. 소속 부서 필터 (차트와 연동 핵심) */}
      <div className={styles.filterGroup}>
        <label>소속 부서</label>
        <select className={styles.select} value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
          {deptList.map(dept => <option key={dept} value={dept}>{dept === 'ALL' ? '전체 부서' : dept}</option>)}
        </select>
      </div>

      {/* 3. 직급 필터 (기존 유지) */}
      <div className={styles.filterGroup}>
        <label>직위</label>
        <select className={styles.select} value={selectedPos} onChange={(e) => setSelectedPos(e.target.value)}>
          {posList.map(pos => <option key={pos} value={pos}>{pos === 'ALL' ? '전체 직위' : pos}</option>)}
        </select>
      </div>

      {/* 4. 상태 필터 (기존 유지) */}
      <div className={styles.filterGroup}>
        <label>상태</label>
        <select className={styles.select} value={selectedStat} onChange={(e) => setSelectedStat(e.target.value)}>
          {statList.map(stat => <option key={stat} value={stat}>{stat === 'ALL' ? '전체 상태' : stat}</option>)}
        </select>
      </div>

      {/* 5. 입사 시기 필터 (추가) - 신규 입사자 분석용 */}
      <div className={styles.filterGroup}>
        <label>입사 년도</label>
        <select className={styles.select} value={hireYear} onChange={(e) => setHireYear(e.target.value)}>
          {yearList.map(year => <option key={year} value={year}>{year === 'ALL' ? '전체 연도' : `${year}년`}</option>)}
        </select>
      </div>

      <button className={styles.resetBtn} onClick={onReset}>
        초기화
      </button>
      <button className={styles.excelBtn} onClick={onExcelDownload}>
          엑셀 저장
        </button>
    </aside>
  );
};

export default WorkforceFilterBar;