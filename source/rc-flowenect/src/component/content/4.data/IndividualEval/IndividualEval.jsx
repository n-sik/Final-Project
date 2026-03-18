import React, { useState, useEffect, useCallback } from 'react';
import {LayoutDashboard} from 'lucide-react';
import apiClient from '../../../../api/apiClient';
import styles from './IndividualEval.module.css';
import OrgChartSidebar from '../AttendLog/components/OrgChartSidebar';
import PageHeader from '../Common/PageHeader';
import PeerCbtiReport from './components/PeerCbtiReport'; 
import AiTotalReport from './components/AiTotalReport'; 

const IndividualEval = () => {
    const [searchParams, setSearchParams] = useState({ empNo: '', empNm: '' });
    const [activeTab, setActiveTab] = useState('CBTI');
    const [evalData, setEvalData] = useState(null);
    const [cbtiAiResult, setCbtiAiResult] = useState(null);
    const [totalAiResult, setTotalAiResult] = useState(null);
    const [isCbtiLoading, setIsCbtiLoading] = useState(false);
    const [isTotalLoading, setIsTotalLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalInitialData, setTotalInitialData] = useState(null);

    const fetchEvalData = useCallback(async (empNo) => {
        if (!empNo) return;
        try {
            setIsLoading(true);
            const response = await apiClient.get(`/api/individual-eval/report/${empNo}`);
            setEvalData(response.data);
        } catch (error) {
            console.error("❌ 기초 데이터 로드 에러:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRunCbtiAnalysis = async (empNo) => {
        if (!empNo) return;
        setIsCbtiLoading(true);
        try {
            const response = await apiClient.post('api/ai/peer/vector-analysis', { empNo });
            setCbtiAiResult(response.data.analysisResult);
        } catch (error) {
            console.error("❌ CBTI 분석 실패:", error);
        } finally {
            setIsCbtiLoading(false);
        }
    };

    const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === '종합평가') {
        try {
            const response = await apiClient.get(`/api/ai/individual/read-status/${searchParams.empNo}`);
            setTotalInitialData(response.data); 
        } catch (error) {
            console.error("데이터는 있는데 백엔드 로직에서 에러 발생:", error);
        }
    }
};

    const handleRunTotalAnalysis = async (empNo) => {
    if (!empNo) return;
    
    setIsTotalLoading(true); 
    try {
        const response = await apiClient.post('/api/ai/individual/total-analysis', { empNo });
        
        if (response.data.status === "SUCCESS") {
            setTotalAiResult(response.data.aiInsight);
            console.log("✅ AI 재분석 완료:", response.data.aiInsight);
        }
    } catch (error) {
        console.error("❌ 종합 재분석 실패:", error);
        alert("AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
        setIsTotalLoading(false); // 로딩 종료
    }
};


   const handleSelectEmp = (empNo, empNm) => {
        setSearchParams({ empNo, empNm });
        setActiveTab('CBTI'); 
        setCbtiAiResult(null); 
        setTotalAiResult(null); 
        setTotalInitialData(null);
    };

    useEffect(() => {
        if (searchParams.empNo) {
            fetchEvalData(searchParams.empNo);
        }
    }, [searchParams.empNo, fetchEvalData]);

    return (
        <div className={styles.container}>
            <PageHeader 
                title="AI 개인 핵심 역량 리포트" 
                subTitle={searchParams.empNo ? 
                    `${searchParams.empNm} (${searchParams.empNo}) 님의 심층 분석 데이터입니다.` : 
                    "분석할 사원을 선택해주세요."}
            >
                {searchParams.empNo && (
                    <div className={styles.headerTabs}>
                        {['CBTI', '종합평가'].map(tab => (
                            <button 
                                key={tab} 
                                className={activeTab === tab ? styles.activeTab : styles.tab} 
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab === 'CBTI' ? '동료 피드백 CBTI' : 'AI 성과 리포트'}
                            </button>
                        ))}
                    </div>
                )}
            </PageHeader>

            <div className={styles.layoutBody}>
                <div className={styles.sidebarWrapper}>
                    <OrgChartSidebar onSelectEmp={handleSelectEmp} activeEmpNo={searchParams.empNo} />
                </div>

                <main className={styles.mainContent}>
                   {searchParams.empNo ? (
                <div className={styles.tabContentCard}>
                                {activeTab === 'CBTI' && (
                                    <PeerCbtiReport 
                                        data={evalData}                
                                        empNo={searchParams.empNo}
                                        aiResult={cbtiAiResult}        
                                        isAiLoading={isCbtiLoading}
                                        onRunAnalysis={handleRunCbtiAnalysis} 
                                    />
                                )}
                                {activeTab === '종합평가' && (
                                    <AiTotalReport 
                                        initialData={totalInitialData}
                                        aiResult={totalAiResult}        
                                        isAiLoading={isTotalLoading}
                                        onRunAnalysis={() => handleRunTotalAnalysis(searchParams.empNo)} 
                                    />
                                )}
                            </div>
                        ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyContent}>
                                <div className={styles.pulseIcon}>
                                    <LayoutDashboard size={50} color="#6366f1" strokeWidth={1.5} />
                                </div>
                                <h3>CBTI / 개인종합평가</h3>
                                <p>좌측에서 부서원을 선택해 주세요.</p>
                                <div className={styles.guideBadge}>CBTI / 개인종합평가 데이터가 여기에 표시됩니다.</div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default IndividualEval;