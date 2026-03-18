import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../../../api/apiClient';
import PageHeader from '../Common/PageHeader';
import Sidebar from './components/Sidebar';
import SummaryCards from './components/SummaryCards';
import DashboardTab from './components/DashboardTab';
import KpiListTab from './components/KpiListTab';
import ReportTab from './components/ReportTab';
import styles from './DeptKpiEval.module.css';

const DeptKpiEval = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [depts, setDepts] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // 1. 부서 목록 로드 (최초 1회)
  useEffect(() => {
    apiClient.get('/api/dept/kpi/depts')
      .then(res => setDepts(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDepts([]));
  }, []);

  // 2. 프로젝트 데이터 가져오기
  const fetchProjectData = useCallback(async () => {
    if (!selectedDept) return;
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/dept/kpi/projects/${selectedDept}`);
      setProjects(res.data || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchProjectData();
  }, [selectedDept, fetchProjectData]);

  // 3. 부서 변경 시 기존 AI 리포트 조회
  useEffect(() => {
    if (!selectedDept) {
      setAiResult(null);
      return;
    }
    
    apiClient.get(`/api/dept/result/${selectedDept}`)
      .then(res => {
        if (res.data && res.data.status === "SUCCESS") {
          setAiResult(res.data.deptAnalysis); 
        } else {
          setAiResult(null);
        }
      })
      .catch(() => setAiResult(null));
  }, [selectedDept]);

  // 4. AI 성과 평가 실행
  const handleAiEvaluation = async () => {
    if (!selectedDept) return alert("부서를 먼저 선택해 주세요.");
    if (projects.length === 0) return alert("분석할 프로젝트 데이터가 없습니다.");

    setIsAiAnalyzing(true);
    try {
      const requestBody = {
        deptCd: selectedDept,
        deptNm: depts.find(d => d.deptCd === selectedDept)?.deptNm,
        projects: projects 
      };

      const res = await apiClient.post(`/api/ai/dept/analysis`, requestBody);
      if (res.data.status === "SUCCESS") {
        setAiResult(res.data.deptAnalysis); 
        alert("AI 부서 성과 분석이 완료되었습니다.");
        setActiveTab('report'); 
      }
    } catch (error) {
      console.error("AI 분석 오류:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // 5. 통계 데이터 계산
  const summary = useMemo(() => {
    if (!projects.length) return { totalKpis: 0, avgProgress: 0, chartData: [] };
    let totalRate = 0, kpiCount = 0;
    const chartData = projects.map(p => {
      const pAvg = p.kpi?.length ? p.kpi.reduce((acc, k) => acc + (Number(k.progressRate) || 0), 0) / p.kpi.length : 0;
      p.kpi?.forEach(k => { totalRate += (Number(k.progressRate) || 0); kpiCount++; });
      return { 
        name: p.projectNm.length > 8 ? p.projectNm.substring(0, 8) + '..' : p.projectNm, 
        progress: Number(pAvg.toFixed(1)) 
      };
    });
    return { totalKpis: kpiCount, avgProgress: kpiCount > 0 ? (totalRate / kpiCount).toFixed(1) : 0, chartData };
  }, [projects]);

  return (
    <div className={styles.pageWrapper}>
      <PageHeader 
        title="부서별 성과 통계" 
        subTitle="AI 성과 분석 엔진을 통해 객관적인 달성 수치를 산출합니다."
      >
        <div className={styles.headerActions}>
          <div className={styles.tabSwitcher}>
            {['dashboard', 'list', 'report'].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? styles.activeTab : ''} 
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'dashboard' ? '현황 대시보드' : tab === 'list' ? '상세 지표 조회' : '성과 리포트'}
              </button>
            ))}
          </div>

          <button 
            className={styles.aiEvalBtn} 
            onClick={handleAiEvaluation}
            disabled={isAiAnalyzing || !selectedDept}
          >
            <span>{isAiAnalyzing ? '분석 중...' : 'AI 성과 평가하기'}</span>
          </button>
        </div>
      </PageHeader>

      <main className={styles.mainContainer}>
        {/* 사이드바: 항상 표시 */}
        <Sidebar depts={depts} selectedDept={selectedDept} onDeptClick={setSelectedDept} />
        
        <section className={styles.contentSection}>
          {loading ? (
            <div className={styles.loadingState}>데이터 분석 자료를 불러오는 중입니다...</div>
          ) : (
            <div className={styles.dashboardWrapper}>
              {/* 요약 카드: 데이터가 없으면 0으로 표시됨 */}
              <SummaryCards 
                projectsCount={projects.length} 
                totalKpis={summary.totalKpis} 
                avgProgress={summary.avgProgress} 
              />
              
              <div className={styles.tabContentArea}>
                {/* 각 탭 컴포넌트 내부에서 데이터가 없을 때의 처리를 수행함 */}
                {activeTab === 'dashboard' && <DashboardTab chartData={summary.chartData} />}
                {activeTab === 'list' && <KpiListTab projects={projects} />}
                {activeTab === 'report' && (
                  <ReportTab 
                    projects={projects} 
                    avgProgress={summary.avgProgress} 
                    deptNm={depts.find(d => d.deptCd === selectedDept)?.deptNm || "부서 미선택"} 
                    aiData={aiResult}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DeptKpiEval;