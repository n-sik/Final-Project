import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import apiClient from '../../../../api/apiClient';
import styles from './ProjectPerformance.module.css';
import SummaryCards from './components/SummaryCards';
import ProjectChart from './components/ProjectChart';
import ProjectTable from './components/ProjectTable';
import PageHeader from '../Common/PageHeader';
import Pagination from '../Common/Pagination';
import ProjectFilterBar from './components/ProjectFilterBar';
import ProjectDetailModal from './components/ProjectDetailModal';

const COLORS = { ING: '#3b82f6', END: '#10b981', HOLD: '#f59e0b', DELAY: '#ef4444' };

const ProjectPerformance = ({ activeSubMenu }) => {
  // 1. 상태 관리
  const [activeTab, setActiveTab] = useState('dashboard');
  const [departments, setDepartments] = useState([]);
  const [allDataForStats, setAllDataForStats] = useState([]); // 차트/통계용 (전체)
  const [pagedProjects, setPagedProjects] = useState([]);     // 테이블용 (페이징)
  const [pagingInfo, setPagingInfo] = useState(null);         // 백엔드에서 준 페이징 정보
  
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. 검색 및 필터 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deptCd, setDeptCd] = useState("");
  const [statCd, setStatCd] = useState("");

  // 3. 데이터 페칭 로직 (개편 핵심)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // [공통] 검색 조건 (백엔드 Map 바인딩용 params[...] 형식)
      const commonParams = {
        'params[keyword]': searchTerm || "",
        'params[startDate]': startDate || "",
        'params[endDate]': endDate || "",
        'params[projectStatCd]': statCd || "",
        'params[deptCd]': deptCd || "", 
      };

      // [A] 차트 및 통계용: 부서 필터를 무시하고 전체를 가져옴
      const statsRes = await apiClient.get('/api/projectdata/paged-list', {
        params: {
          ...commonParams,
          'paging.page': 1,
          'paging.recordSize': 9999, // 전체 데이터를 위해 크게 잡음
        }
      });
      setAllDataForStats(statsRes.data.list || []);

      // [B] 상세 목록용: 현재 탭이 'list'일 때만 부서 필터와 페이징 적용
      if (activeTab === 'list') {
        const listRes = await apiClient.get('/api/projectdata/paged-list', {
          params: {
            ...commonParams,
            'paging.page': currentPage,
            'paging.recordSize': 5, // 페이지당 5개
          }
        });
        setPagedProjects(listRes.data.list || []);
        setPagingInfo(listRes.data.paging);
      }
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, startDate, endDate, deptCd, statCd, currentPage, activeTab]);

  // 부서 목록은 최초 1회만 로드
  useEffect(() => {
    apiClient.get('/api/emp/departments').then(res => setDepartments(res.data || []));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 필터 변경 시 페이지 초기화
  useEffect(() => { setCurrentPage(1); }, [searchTerm, startDate, endDate, deptCd, statCd]);

  // 4. 차트 클릭 시 리스트 탭 이동 및 부서 필터 자동 적용
  const handleChartClick = (deptNm) => {
    const target = departments.find(d => d.deptNm === deptNm);
    if (target) {
      setDeptCd(target.deptCd);
      setActiveTab('list');
    }
  };

  const handleExcelDownload = () => {
  if (allDataForStats.length === 0) return alert("다운로드할 데이터가 없습니다.");
  console.log("엑셀 변환 대상 첫 번째 데이터:", allDataForStats[0]);
  const excelData = allDataForStats.map(item => ({
    "번호": item.projectNo,
    "프로젝트명": item.projectNm,
    "부서": item.deptNm,
    "상태": item.projectStatCd,
    "내용": item.projectDesc, // 지난 답변에서 추가한 내용
    "시작일": item.startDtm?.split('T')[0],
    "종료일": item.endDtm?.split('T')[0] // 종료일 추가 (키값이 다를 경우 수정 필요)
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);

  ws['!cols'] = [
    { wch: 8 },  // 번호
    { wch: 30 }, // 프로젝트명
    { wch: 15 }, // 부서
    { wch: 10 }, // 상태
    { wch: 40 }, // 내용
    { wch: 12 }, // 시작일
    { wch: 12 }  // 종료일
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "프로젝트현황");
  XLSX.writeFile(wb, `Project_Report.xlsx`);
};
  // 6. 통계 계산 (useMemo 활용)
  const summary = useMemo(() => {
    const data = allDataForStats;
    return {
      total: data.length,
      end: data.filter(p => p.projectStatCd === 'END').length,
      ing: data.filter(p => p.projectStatCd === 'ING').length,
      delay: data.filter(p => p.projectStatCd === 'DELAY').length // 백엔드 코드에 맞게 수정
    };
  }, [allDataForStats]);

  const chartData = useMemo(() => {
    return departments.map(dept => {
      const projects = allDataForStats.filter(p => p.deptCd === dept.deptCd);
      return {
        name: dept.deptNm,
        end: projects.filter(p => p.projectStatCd === 'END').length,
        ing: projects.filter(p => p.projectStatCd === 'ING').length,
        delay: projects.filter(p => p.projectStatCd === 'DELAY').length
      };
    }).filter(d => (d.end + d.ing + d.delay) > 0);
  }, [departments, allDataForStats]);

  return (
    <div className={styles.dashboardWrapper}>
      <PageHeader 
      title="프로젝트 수행 현황" 
      subTitle="부서별 프로젝트 수행 성과를 통합 모니터링하여 운영 지표를 제공합니다."
      >
        <div className={styles.tabSwitcher}>
          <button className={activeTab === 'dashboard' ? styles.activeTab : ''} onClick={() => setActiveTab('dashboard')}>대시보드</button>
          <button className={activeTab === 'list' ? styles.activeTab : ''} onClick={() => setActiveTab('list')}>상세목록</button>
        </div>
      </PageHeader>

      <ProjectFilterBar 
        startDate={startDate} setStartDate={setStartDate}
        endDate={endDate} setEndDate={setEndDate}
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        selectedDept={deptCd} setSelectedDept={setDeptCd}
        selectedStat={statCd} setSelectedStat={setStatCd}
        departments={departments}
        onExcelDownload={handleExcelDownload}
      />

      <div className={styles.contentArea}>
        <SummaryCards summary={summary} />
        {loading ? (
          <div className={styles.loading}>데이터 로드 중...</div>
        ) : (
          activeTab === 'dashboard' ? (
            <ProjectChart data={chartData} colors={COLORS} onBarClick={handleChartClick} />
          ) : (
            <div className={styles.tableContainer}>
              <ProjectTable 
                projects={pagedProjects}
                onRowClick={(p) => { setSelectedProject(p); setIsModalOpen(true); }} 
              />
              {pagingInfo && (
                <Pagination 
                  paging={pagingInfo} 
                  currentPage={currentPage} 
                  onPageChange={setCurrentPage} 
                />
              )}
            </div>
          )
        )}
      </div>
      {isModalOpen && <ProjectDetailModal project={selectedProject} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ProjectPerformance;