import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import apiClient from '../../../../api/apiClient';
import styles from './WorkforceDist.module.css';
import WorkforceFilterBar from './components/WorkforceFilterBar';
import WorkforceChart from './components/WorkforceChart';
import WorkforceTable from './components/WorkforceTable';
import WorkforceStats from './components/WorkforceStats';
import PageHeader from '../Common/PageHeader';
import Pagination from '../Common/Pagination';

const WorkforceDist = ({ activeSubMenu }) => {
  // 1. 상태 관리
  const [employees, setEmployees] = useState([]);
  const [allDataForStats, setAllDataForStats] = useState([]);
  const [pagingInfo, setPagingInfo] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPos, setSelectedPos] = useState("ALL");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedStat, setSelectedStat] = useState("ALL");
  const [activeTab, setActiveTab] = useState('chart');
  const [loading, setLoading] = useState(false);

 const handleExcelDownload = () => {
  if (allDataForStats.length === 0) return alert("다운로드할 데이터가 없습니다.");

 if (allDataForStats.length === 0) return alert("다운로드할 데이터가 없습니다.");

  const excelData = allDataForStats.map(emp => ({
    "사번": emp.empNo || "-",
    "이름": emp.empNm || "-",
    "부서": emp.deptNm || "-",
    "직위": emp.posNm || "-",
    "상태": emp.empStatNm || "정보없음", // 이미 한글로 들어있으므로 그대로 사용
    "입사일": emp.hireDt || "-",        // '2026-02-10' 형식이므로 split 불필요
    "부서코드": emp.deptCd || "-"       // 필요시 추가
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);

  // 셀 너비 설정
  ws['!cols'] = [
    { wch: 12 }, // 사번
    { wch: 12 }, // 이름
    { wch: 15 }, // 부서
    { wch: 10 }, // 직위
    { wch: 10 }, // 상태
    { wch: 15 }, // 입사일
    { wch: 15 }  // 부서코드
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "인력현황");
  
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `인력현황_리포트_${today}.xlsx`);
};

  const handleReset = () => {
    setSearchTerm(""); setSelectedPos("ALL"); setSelectedDept("ALL"); setSelectedStat("ALL");
    setCurrentPage(1);
  };

  const handleChartClick = (deptNm) => {
    setSelectedDept(deptNm); 
    setCurrentPage(1); 
    setActiveTab('list');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const commonParams = {
        'params[searchTerm]': searchTerm || "",
        'params[posNm]': selectedPos === "ALL" ? "" : selectedPos,
        'params[empStatNm]': selectedStat === "ALL" ? "" : selectedStat,
        'params[deptNm]': selectedDept === "ALL" ? "" : selectedDept,
      };

      const statsRes = await apiClient.get('/api/dist/paged-list', { 
        params: {
          ...commonParams,
          'paging.page': 1,
          'paging.recordSize': 9999,
        }
      });

      const fullList = statsRes.data.list || [];
      setAllDataForStats(fullList);
      setTotalCount(statsRes.data.paging.totalCount);

      if (activeTab === 'list') {
        const listRes = await apiClient.get('/api/dist/paged-list', { 
          params: {
            ...commonParams,
            'paging.page': currentPage,
            'paging.recordSize': 10, 
            'paging.pageSize': 5
          }
        });
        setEmployees(listRes.data.list || []);
        setPagingInfo(listRes.data.paging); 
      } else {
        setEmployees(fullList);
      }
    } catch (error) {
      console.error("데이터 로드 실패", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedPos, selectedDept, selectedStat, currentPage, activeTab]);

  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchTerm, selectedPos, selectedDept, selectedStat]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  return (
    <div className={styles.container}>
      <PageHeader 
        title={activeSubMenu || "인력 현황 및 통계"} 
        subTitle="전사 인력 구성과 부서별 분포 현황을 시각화된 차트와 명부로 확인하세요."
      >
        <div className={styles.tabs}>
          <button 
            className={activeTab === 'chart' ? styles.activeTab : styles.tab} 
            onClick={() => setActiveTab('chart')}
          >
            대시보드
          </button>
          <button 
            className={activeTab === 'list' ? styles.activeTab : styles.tab} 
            onClick={() => setActiveTab('list')}
          >
            상세명부
          </button>
        </div>
      </PageHeader>

      <div className={styles.layoutBody}>
        <WorkforceFilterBar 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          selectedPos={selectedPos} setSelectedPos={setSelectedPos}
          selectedDept={selectedDept} setSelectedDept={setSelectedDept}
          selectedStat={selectedStat} setSelectedStat={setSelectedStat}
          employees={allDataForStats} onReset={handleReset} onExcelDownload={handleExcelDownload}
        />
        
        <main className={styles.main}>
          <WorkforceStats data={allDataForStats} total={totalCount} />
          
          {loading ? (
            <div className={styles.loading}>데이터를 불러오는 중...</div>
          ) : (
            activeTab === 'chart' ? (
              <div className={styles.chartWrapper}> 
                <WorkforceChart data={allDataForStats} onBarClick={handleChartClick} />
              </div>
            ) : (
              <div className={styles.listSection}>
                <div className={styles.tableInfo}>
                  검색 결과: <strong>{totalCount}</strong>명
                </div>
                
                <div className={styles.tableWrapper}>
                  <WorkforceTable data={employees} />
                </div>
                
                <div className={styles.paginationWrapper}>
                  {pagingInfo && pagingInfo.totalCount > 0 && (
                    <Pagination 
                      paging={pagingInfo} 
                      currentPage={currentPage} 
                      onPageChange={(page) => setCurrentPage(page)} 
                    />
                  )}
                </div>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkforceDist;