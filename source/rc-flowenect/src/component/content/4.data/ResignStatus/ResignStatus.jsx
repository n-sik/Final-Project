import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AppClient from '../../../../api/apiClient';
import styles from './ResignStatus.module.css';
import RetireSearchBar from './components/RetireSearchBar';
import DeptStatusTable from './components/DeptStatusTable';
import RetireDetailTable from './components/RetireDetailTable'; // ✅ 추가
import PageHeader from '../Common/PageHeader';
import RetireDetailModal from './components/RetireDetailModal';
import Pagination from '../Common/Pagination';
import * as XLSX from 'xlsx';

const ResignStatus = () => {
  const [list, setList] = useState([]); 
  const [deptStats, setDeptStats] = useState([]); 
  const [pagingInfo, setPagingInfo] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const [searchParams, setSearchParams] = useState({
    keyword: '',
    startDate: '',
    endDate: '',
    dept: 'ALL',
    page: 1,
    recordSize: 10
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        AppClient.get('/api/retire/list', {
          params: {
            'paging.page': searchParams.page,
            'paging.recordSize': searchParams.recordSize,
            'params[dept]': searchParams.dept === 'ALL' ? '' : searchParams.dept,
            'params[keyword]': searchParams.keyword,
            'params[startDate]': searchParams.startDate,
            'params[endDate]': searchParams.endDate,
          }
        }),
        AppClient.get('/api/retire/summary') 
      ]);

      setList(listRes.data.list || []);
      setPagingInfo(listRes.data.paging);
      setDeptStats(summaryRes.data || []); 
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculatedPaging = useMemo(() => {
    if (!pagingInfo || pagingInfo.totalCount === 0) return null;
    const totalPages = Math.ceil(pagingInfo.totalCount / searchParams.recordSize);
    return {
      ...pagingInfo,
      totalPageCount: totalPages,
      existNextPage: searchParams.page < totalPages
    };
  }, [pagingInfo, searchParams.recordSize, searchParams.page]);

  const handlePageChange = (newPage) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = () => {
    setSearchParams(prev => ({ ...prev, page: 1 }));
  };

  const handleDeptClick = (deptCd) => {
    setSearchParams(prev => ({ ...prev, dept: deptCd, page: 1 }));
  };

  const handleRowClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleExcelDownload = () => {
  if (!list || list.length === 0) {
    alert("다운로드할 데이터가 없습니다.");
    return;
  }

  // 1. 상태 코드 한글 매핑 (데이터에 존재하는 모든 코드 대응)
  const STATUS_LABELS = {
    APPROVED: '승인',
    REJECTED: '반려',
    CANCELED: '취소',
    DRAFT: '임시저장',
    WAIT: '대기'
  };

  // 2. 엑셀 변환용 데이터 가공
  const excelData = list.map((item, index) => {
    // 날짜 포맷팅 (T 제거 및 시간 분리)
    const formattedSubmitDate = item.submitDtm ? item.submitDtm.replace('T', ' ') : '-';
    const formattedRetireDate = item.expRetrDt ? item.expRetrDt.split(' ')[0] : '-';

    return {
      "No": index + 1,
      "사번": item.empNo,
      "성명": item.docWrtrEmpNm || '관리자',
      "부서명": item.deptNm,
      "퇴직예정일": formattedRetireDate,
      "진행상태": STATUS_LABELS[item.procStatCd] || item.procStatCd,
      "퇴직사유": item.retrRsn || "사유 미기재", // 💡 요청하신 퇴직 사유 추가
      "신청일시": formattedSubmitDate,
      "승인번호": item.aprvNo || '-'
    };
  });

  // 🔍 콘솔 로그로 데이터 최종 확인
  console.log("📊 엑셀 저장용 가공 데이터:");
  console.table(excelData);

  // 3. XLSX 파일 생성 및 다운로드
  try {
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "퇴직신청목록");

    // 컬럼 너비 자동 조절 (퇴직사유 등 긴 문장 대응)
    const wscols = [
      { wch: 5 },  // No
      { wch: 10 }, // 사번
      { wch: 10 }, // 성명
      { wch: 15 }, // 부서명
      { wch: 15 }, // 퇴직예정일
      { wch: 10 }, // 진행상태
      { wch: 40 }, // 퇴직사유 (길게 설정)
      { wch: 20 }, // 신청일시
      { wch: 10 }  // 승인번호
    ];
    worksheet['!cols'] = wscols;

    const fileName = `퇴직신청현황_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (err) {
    console.error("엑셀 저장 실패:", err);
  }
};

  return (
    <div className={styles['dashboard-container']}>
      <PageHeader 
        title="퇴직 신청 처리 현황" 
        subTitle="백엔드 통계 및 페이징 데이터를 기반으로 실시간 처리 현황을 조회합니다."
      />

      <RetireSearchBar 
        searchParams={searchParams} 
        setSearchParams={setSearchParams} 
        onSearch={handleSearch} 
        onExcelDownload={handleExcelDownload}
        deptStats={deptStats}
      />

      <div className={styles['main-content-wrapper']}>
        {/* 사이드바 영역 */}
        <aside className={styles['dept-side-panel']}>
          <div className={styles['panel-header']}>
            <h3>부서별 요약 현황</h3>
          </div>
          <DeptStatusTable 
            data={deptStats} 
            onDeptSelect={handleDeptClick} 
            activeDept={searchParams.dept} 
          />
        </aside>

        {/* 메인 상세 테이블 영역 */}
        <main className={styles['detail-main-panel']}>
          <div className={styles['panel-header']}>
            <h3>상세 내역 (총 {pagingInfo?.totalCount || 0}건)</h3>
          </div>
          
          {/* ✅ 컴포넌트화하여 메인 코드를 단순화 */}
          <RetireDetailTable 
            list={list}
            loading={loading}
            searchParams={searchParams}
            onRowClick={handleRowClick}
          />

          <div className={styles['pagination-wrapper']}>
            {calculatedPaging && (
              <Pagination 
                paging={calculatedPaging} 
                currentPage={searchParams.page} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <RetireDetailModal 
          data={selectedItem} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
};

export default ResignStatus;