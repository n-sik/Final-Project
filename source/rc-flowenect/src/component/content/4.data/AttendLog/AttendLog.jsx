import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import apiClient from '../../../../api/apiClient';
import styles from './AttendLog.module.css';
import OrgChartSidebar from './components/OrgChartSidebar';
import AttendSearchForm from './components/AttendSearchForm';
import AttendTable from './components/AttendTable';
import PageHeader from '../Common/PageHeader';
import Pagination from '../Common/Pagination';

const AttendLog = () => {
    const [list, setList] = useState([]);
    const [paging, setPaging] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [searchParams, setSearchParams] = useState({
        empNo: '',
        empNm: '', 
        startDate: '',
        endDate: '',
        status: '',
        lateOnly: 'N',
        autoOutOnly: 'N'
    });

    const STATUS_MAP = {
        'PRESENT': '출근',
        'LATE': '지각',
        'VACATION': '휴가',
        'ABSENT': '결근',
        'N': '미등록'
    };

    // 엑셀 다운로드 로직
    const handleExcelDownload = async () => {
        if (!searchParams.empNo) return alert("사원을 먼저 선택해주세요.");
        try {
            setIsLoading(true);
            const response = await apiClient.get('api/attendlog/list', {
                params: {
                    'paging.page': 1,
                    'paging.recordSize': 9999,
                    'params[empNo]': searchParams.empNo,
                    'params[startDate]': searchParams.startDate,
                    'params[endDate]': searchParams.endDate,
                    'params[status]': searchParams.status,
                    'params[lateOnly]': searchParams.lateOnly,
                    'params[autoOutOnly]': searchParams.autoOutOnly
                }
            });
            const allData = response.data.list || [];
            if (allData.length === 0) return alert("다운로드할 데이터가 없습니다.");

            const excelData = allData.map(item => ({
                "근무일": item.workDt?.split(' ')[0] || "-",
                "이름": item.empNm || "-",
                "출근": item.inDtm?.split(' ')[1] || "-",
                "퇴근": item.outDtm?.split(' ')[1] || (item.attdStatCd === 'PRESENT' ? "미퇴근" : "-"),
                "상태": STATUS_MAP[item.attdStatCd] || item.attdStatCd || "-",
                "비고": item.remark || ""
            }));

            const ws = XLSX.utils.json_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "근태기록");
            XLSX.writeFile(wb, `Attend_${searchParams.empNm}_${new Date().toISOString().split('T')[0]}.xlsx`);
        } catch (e) { 
            console.error("Excel Download Error:", e); 
        } finally { 
            setIsLoading(false); 
        }
    };

    // 데이터 조회 로직
    const fetchList = useCallback(async (pageNo = 1) => {
        if (!searchParams.empNo) return;
        try {
            setIsLoading(true);
            const response = await apiClient.get('api/attendlog/list', {
                params: {
                    'paging.page': pageNo,
                    'paging.recordSize': 10,
                    'params[empNo]': searchParams.empNo,
                    'params[startDate]': searchParams.startDate,
                    'params[endDate]': searchParams.endDate,
                    'params[status]': searchParams.status,
                    'params[lateOnly]': searchParams.lateOnly,
                    'params[autoOutOnly]': searchParams.autoOutOnly
                }
            });
            setList(response.data.list || []);
            setPaging(response.data.paging);
        } catch (e) { 
            console.error("Fetch List Error:", e); 
        } finally { 
            setIsLoading(false); 
        }
    }, [searchParams]);

    // 사번 선택 시 필터 적용 및 목록 자동 로드
    useEffect(() => { 
        if (searchParams.empNo) fetchList(1); 
    }, [searchParams.empNo, fetchList]);

    return (
        <div className={styles.attendLogWrapper}>
            <PageHeader 
                title="근태 현황 조회" 
                subTitle={searchParams.empNo ? `${searchParams.empNm} (${searchParams.empNo}) 님의 기록입니다.` : "좌측 조직도에서 사원을 선택하세요."} 
            />

            <div className={styles.attendLogContainer}>
                {/* 1. 좌측 사이드바: 조직도 */}
                <OrgChartSidebar 
                    onSelectEmp={(no, nm) => setSearchParams(p => ({...p, empNo: no, empNm: nm}))} 
                    activeEmpNo={searchParams.empNo} 
                />
                
                {/* 2. 우측 콘텐츠: 검색폼 + 테이블 + 페이징 (일관된 레이아웃 유지) */}
                <div className={styles.attendLogContent}>
                    {/* 검색 및 필터링 */}
                    <AttendSearchForm 
                        searchParams={searchParams} 
                        setSearchParams={setSearchParams} 
                        onSearch={() => fetchList(1)} 
                        onExcelDownload={handleExcelDownload} 
                    />
                    
                    {/* 데이터 테이블 (데이터 유무에 상관없이 렌더링) */}
                    <AttendTable list={list} isLoading={isLoading} />
                    
                    {/* 페이징 (데이터가 1건이라도 있을 때만 노출) */}
                    {paging && paging.totalCount > 0 && (
                        <Pagination 
                            paging={paging} 
                            currentPage={paging.page} 
                            onPageChange={fetchList} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendLog;