import React from 'react';
import { CalendarDays, Search, RotateCcw, Download, SlidersHorizontal } from 'lucide-react';
import styles from '../ResignStatus.module.css';

const RetireSearchBar = ({ searchParams, setSearchParams, onExcelDownload, deptStats }) => {

  const handleReset = () => {
    setSearchParams({ dept: 'ALL', keyword: '', startDate: '', endDate: '' });
  };

  const hasFilter = searchParams.dept !== 'ALL' || searchParams.keyword || 
                    searchParams.startDate || searchParams.endDate;

  return (
    <section className={styles.filterBar}>
      <div className={styles.filterLeft}>

        {/* 부서 */}
        <div className={styles.selectWrapper}>
          <SlidersHorizontal size={13} className={styles.selectIcon} />
          <select
            className={styles.selectInput}
            value={searchParams.dept}
            onChange={(e) => setSearchParams({ ...searchParams, dept: e.target.value })}
          >
            <option value="ALL">전체 부서</option>
            {deptStats?.map((dept) => (
              <option key={dept.docWrtrDeptCd} value={dept.docWrtrDeptCd}>
                {dept.deptNm}
              </option>
            ))}
          </select>
        </div>

        {/* 검색어 */}
        <div className={styles.searchBox}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="이름 또는 사번"
            value={searchParams.keyword}
            onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
          />
        </div>

        {/* 날짜 범위 */}
        <div className={styles.dateRangeBox}>
          <CalendarDays size={14} className={styles.filterIcon} />
          <input
            type="date"
            className={styles.dateInput}
            value={searchParams.startDate}
            onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
          />
          <span className={styles.dateSep}>—</span>
          <input
            type="date"
            className={styles.dateInput}
            value={searchParams.endDate}
            onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
          />
        </div>

      </div>

      <div className={styles.filterRight}>
        <button className={styles.resetBtn} onClick={handleReset} disabled={!hasFilter}>
          <RotateCcw size={14} />
        </button>
        <button className={styles.excelBtn} onClick={onExcelDownload}>
          <Download size={14} /> 엑셀
        </button>
      </div>
    </section>
  );
};

export default RetireSearchBar;