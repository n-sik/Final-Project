import React from 'react';
import { Search, X, Download, RotateCcw, CalendarDays, SlidersHorizontal } from 'lucide-react';
import styles from '../ProjectPerformance.module.css';

const ProjectFilterBar = ({
  startDate, setStartDate,
  endDate, setEndDate,
  searchTerm, setSearchTerm,
  selectedDept, setSelectedDept,
  selectedStat, setSelectedStat,
  departments,
  onSearch,
  onExcelDownload,
  setPage
}) => {
  const handleChange = (setter, value) => {
    setter(value);
    if (setPage) setPage(1);
  };

  const handleReset = () => {
    setStartDate(""); setEndDate("");
    setSearchTerm(""); setSelectedDept(""); setSelectedStat("");
    if (setPage) setPage(1);
  };

  const hasFilter = startDate || endDate || searchTerm || selectedDept || selectedStat;

  return (
    <div className={styles.filterBarWrapper}>

      {/* 왼쪽: 날짜 + 셀렉트 */}
      <div className={styles.filterGroupLeft}>

        {/* 날짜 범위 */}
        <div className={styles.dateRangeBox}>
          <CalendarDays size={15} className={styles.filterIcon} />
          <input type="date" value={startDate}
            onChange={(e) => handleChange(setStartDate, e.target.value)}
            className={styles.dateInput} />
          <span className={styles.dateSeparator}>—</span>
          <input type="date" value={endDate}
            onChange={(e) => handleChange(setEndDate, e.target.value)}
            className={styles.dateInput} />
        </div>

        <div className={styles.selectWrapper}>
          <SlidersHorizontal size={13} className={styles.selectIcon} />
          <select className={styles.selectInput} value={selectedDept}
            onChange={(e) => handleChange(setSelectedDept, e.target.value)}>
            <option value="">전체 부서</option>
            {departments.map(d => (
              <option key={d.deptCd} value={d.deptCd}>{d.deptNm}</option>
            ))}
          </select>
        </div>

        <select className={styles.selectInput} value={selectedStat}
          onChange={(e) => handleChange(setSelectedStat, e.target.value)}>
          <option value="">전체 상태</option>
          <option value="ING">진행중</option>
          <option value="END">완료</option>
          <option value="HOLD">보류</option>
          <option value="DELAY">지연</option>
        </select>

      </div>

      {/* 오른쪽: 검색 + 초기화 + 엑셀 */}
      <div className={styles.filterGroupRight}>

        <div className={styles.searchBar}>
          <Search size={15} className={styles.searchIcon} />
          <input value={searchTerm}
            onChange={(e) => handleChange(setSearchTerm, e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            placeholder="프로젝트명 검색..." />
          {searchTerm && (
            <X size={14} className={styles.clearIcon}
              onClick={() => handleChange(setSearchTerm, "")} />
          )}
        </div>

        <button className={styles.resetBtn} onClick={handleReset}
          title="필터 초기화" disabled={!hasFilter}>
          <RotateCcw size={14} />
        </button>

        <button className={styles.excelBtn} onClick={onExcelDownload}>
          <Download size={14} /> 엑셀
        </button>

      </div>
    </div>
  );
};

export default ProjectFilterBar;