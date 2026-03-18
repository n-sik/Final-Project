import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import styled from "./Annual.module.css";
import apiClient from "../../../api/apiClient";

// ── 당해 연도 동적 계산 (매년 자동 갱신) ──
const CURRENT_YEAR = new Date().getFullYear();

const POSITIONS = ["전체", "사원", "대리", "과장", "차장", "부장"];

// 연도 셀렉트(현재 기준 -2 ~ +1)
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - 2 + i);

const myTheme = themeQuartz.withParams({
  fontSize: 13,
  headerFontSize: 13,
  headerFontWeight: 700,
  headerBackgroundColor: "#f8fafc",
  headerTextColor: "#0f172a",
  rowHeight: 48,
  headerHeight: 44,
  borderColor: "#eef2f7",
  rowHoverColor: "#f1f5ff",
  selectedRowBackgroundColor: "#e9efff",
  cellTextColor: "#0f172a",
  backgroundColor: "#ffffff",
  oddRowBackgroundColor: "#ffffff",
});

export default function Annual() {
  const gridRef = useRef(null);
  const toastTimer = useRef(null);

  const [rowData, setRowData] = useState([]);

  // 필터/조건
  const [year, setYear] = useState(CURRENT_YEAR);
  const [search, setSearch] = useState("");
  const [filterPosition, setFilterPosition] = useState("전체");

  // 일괄부여
  const [bulkPosition, setBulkPosition] = useState("사원");
  const [bulkDays, setBulkDays] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);

  // 삭제
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Toast ──
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  const showToast = useCallback((type, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // 언마운트 시 타이머 정리
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const API_URL = "/api/leave";

  // ── [조회] API 호출 함수 ──
  const fetchAnnualList = useCallback(async () => {
    try {
      const response = await apiClient.get(`${API_URL}/readList`, {
        params: {
          baseYr: year,
          posNm: filterPosition,
          search: search,
        },
      });
      setRowData(response.data);
    } catch (error) {
      console.error("조회 실패:", error);
      showToast("error", "데이터를 불러오는 중 오류가 발생했습니다.");
    }
  }, [year, filterPosition, search, showToast]);

  useEffect(() => {
    fetchAnnualList();
  }, [fetchAnnualList]);

  // ── [삭제] 선택 삭제 API 연결 ──
  const handleDeleteSelected = async () => {
    const ids = selectedRows.map((r) => r.annualNo);
    try {
      await apiClient.delete(`${API_URL}/removeSelected`, { data: ids });
      showToast("success", "데이터가 삭제되었습니다.");

      gridRef.current?.api.deselectAll();

      fetchAnnualList();
      setSelectedRows([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      showToast("error", "삭제 실패");
    }
  };

  // ── [일괄부여] API 연결 ──
  const handleBulkGrant = async () => {
    const days = parseInt(bulkDays, 10);
    try {
      await apiClient.put(`${API_URL}/upsertBulk`, null, {
        params: {
          baseYr: year,
          posNm: bulkPosition,
          totAnnualLv: days,
        },
      });
      showToast("success", `${bulkPosition} 직위 연차 부여 성공`);
      fetchAnnualList();
      setShowBulkModal(false);
      setBulkDays("");
    } catch (error) {
      showToast("error", "일괄 부여 실패");
    }
  };

  // ── 요약 ──
  const summary = useMemo(() => {
    return {
      total: rowData.length,
      totalLeaveSum: rowData.reduce((s, r) => s + (r.totAnnualLv || 0), 0),
      usedLeaveSum: rowData.reduce((s, r) => s + (r.usedAnnualLv || 0), 0),
      remainSum: rowData.reduce((s, r) => s + (r.remAnnualLv || 0), 0),
      lowRemain: rowData.filter((r) => (r.remAnnualLv || 0) <= 2).length,
      sickSum: rowData.reduce((s, r) => s + (r.sickLv || 0), 0),
    };
  }, [rowData]);

  // ── 그리드 이벤트 ──
  const onSelectionChanged = useCallback((event) => {
    const selectedData = event.api.getSelectedRows();
    setSelectedRows(selectedData);
  }, []);

  const onCellValueChanged = useCallback(
    async (params) => {
      const sanitize = (n) => {
        const v = Number(n);
        return Number.isNaN(v) || v < 0 ? 0 : v;
      };

      const nextData = {
        ...params.data,
        sickLv: sanitize(params.data.sickLv),
        officialLv: sanitize(params.data.officialLv),
        rewardLv: sanitize(params.data.rewardLv),
      };
      console.log(nextData);

      try {
        await apiClient.put(`${API_URL}/upsert`, nextData);
        fetchAnnualList();
      } catch (error) {
        showToast("error", "저장에 실패했습니다.");
        fetchAnnualList();
      }
    },
    [fetchAnnualList, showToast],
  );

  const handleSingleDelete = async (annualNo) => {
    try {
      await apiClient.delete(`${API_URL}/removeSelected`, { data: [annualNo] });
      showToast("success", "삭제되었습니다.");
      fetchAnnualList();
    } catch (error) {
      showToast("error", "삭제 실패");
    }
  };

  // ── 컬럼 정의 ──
  const columnDefs = useMemo(
    () => [
      { field: "annualNo", hide: true },
      { field: "empNo", headerName: "사원번호", flex: 1, editable: false },
      { field: "empNm", headerName: "사원", flex: 1, editable: false },
      { field: "deptNm", headerName: "부서", flex: 1, editable: false },
      { field: "posNm", headerName: "직위", flex: 1, editable: false },
      {
        field: "totAnnualLv",
        headerName: "총 연차",
        flex: 1,
        editable: false,
        valueFormatter: (p) => p.value ?? 0,
        cellClass: styled.cellStrong,
      },
      {
        field: "usedAnnualLv",
        headerName: "사용연차",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        valueFormatter: (p) => p.value ?? 0,
        cellClass: styled.cellEditable,
      },
      {
        headerName: "남은연차",
        flex: 1,
        editable: false,
        valueGetter: (p) => p.data.remAnnualLv ?? 0,
        cellClass: (p) => {
          const v = p.data.remAnnualLv ?? 0;
          if (v <= 2) return styled.cellDanger;
          if (v <= 5) return styled.cellWarn;
          return styled.cellOk;
        },
      },
      {
        field: "sickLv",
        headerName: "병가",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        valueFormatter: (p) => p.value ?? 0,
        cellClass: styled.cellEditable,
      },
      {
        field: "officialLv",
        headerName: "공가",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        valueFormatter: (p) => p.value ?? 0,
        cellClass: styled.cellEditable,
      },
      {
        field: "rewardLv",
        headerName: "포상휴가",
        flex: 1,
        editable: true,
        cellEditor: "agNumberCellEditor",
        valueFormatter: (p) => p.value ?? 0,
        cellClass: styled.cellEditable,
      },
    ],
    [year],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      cellClass: styled.cellCenter,
      headerClass: styled.headerCenter,
      cellEditorParams: { useFormatter: true },
    }),
    [],
  );

  return (
    <div className={styled.page}>
      {/* ── Toast 알림 ── */}
      {toast && (
        <div className={`${styled.toast} ${styled[`toast_${toast.type}`]}`}>
          <span className={styled.toastIcon}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          <span className={styled.toastMessage}>{toast.message}</span>
          {/* <button className={styled.toastClose} onClick={() => setToast(null)}>
            ×
          </button> */}
        </div>
      )}

      {/* 헤더 */}
      <div className={styled.headerWrap}>
        <div className={styled.pageHeader}>
          <div>
            <h1 className={styled.pageTitle}>연차 관리</h1>
            <p className={styled.pageSubtitle}>
              {year}년도 기준 · 총 {rowData.length}명
            </p>
          </div>
        </div>
      </div>

      {/* 메인 카드 */}
      <div className={styled.mainCard}>
        {/* 툴바 */}
        <div className={styled.toolbar}>
          <div className={styled.leftTools}>
            <div className={styled.searchBox}>
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                placeholder="사원번호 / 사원명 / 직위 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={styled.select}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>

            <select
              className={styled.select}
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
            >
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className={styled.rightTools}>
            {selectedRows.length > 0 && (
              <span className={styled.selectedInfo}>
                {selectedRows.length}명 선택됨
              </span>
            )}
            <button
              className={`${styled.btn} ${styled.btnDanger}`}
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedRows.length === 0}
              style={{
                opacity: selectedRows.length > 0 ? 1 : 0.5,
                cursor: selectedRows.length > 0 ? "pointer" : "not-allowed",
              }}
            >
              🗑 초기화
              {selectedRows.length > 0 && `(${selectedRows.length})`}
            </button>

            <button
              className={`${styled.btn} ${styled.btnPrimary}`}
              onClick={() => setShowBulkModal(true)}
            >
              📋 직위별 연차 일괄 부여
            </button>
          </div>
        </div>

        {/* 그리드 */}
        <div className={styled.gridWrap}>
          <AgGridReact
            ref={gridRef}
            theme={myTheme}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowSelection={{
              mode: "multiRow",
              checkboxes: true,
              headerCheckbox: true,
              enableClickSelection: false,
            }}
            onSelectionChanged={onSelectionChanged}
            onCellValueChanged={onCellValueChanged}
            stopEditingWhenCellsLoseFocus
            suppressRowTransform
            getRowId={(params) => String(params.data.empNo)}
          />
        </div>

        <p className={styled.editHint}>
          💡 <b>병가/공가/포상휴가</b> 셀을 더블클릭하여 수정할 수 있습니다.
          (년도 기준: 상단 선택 연도)
        </p>
      </div>

      {/* 일괄 부여 모달 */}
      {showBulkModal && (
        <div
          className={styled.modalBackdrop}
          onClick={() => setShowBulkModal(false)}
        >
          <div className={styled.modal} onClick={(e) => e.stopPropagation()}>
            <h3>직위별 연차 일괄 부여</h3>
            <p>
              <b>{year}년도</b> 기준으로 선택한 직위에 <b>총 연차</b>를 일괄
              부여합니다.
            </p>

            <div className={styled.field}>
              <label>대상 직위</label>
              <select
                value={bulkPosition}
                onChange={(e) => setBulkPosition(e.target.value)}
              >
                {POSITIONS.map((pos) => (
                  <option key={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className={styled.field}>
              <label>부여할 연차 일수 (직접 입력)</label>
              <input
                type="number"
                min="0"
                placeholder="예: 15"
                value={bulkDays}
                onChange={(e) => setBulkDays(e.target.value)}
              />
            </div>

            <div className={styled.modalActions}>
              <button
                className={`${styled.btn} ${styled.btnOutline}`}
                onClick={() => setShowBulkModal(false)}
              >
                취소
              </button>
              <button
                className={`${styled.btn} ${styled.btnPrimary}`}
                onClick={handleBulkGrant}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 선택 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className={styled.modalBackdrop}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className={styled.modal} onClick={(e) => e.stopPropagation()}>
            <h3>선택 항목 초기화</h3>
            <p>
              선택한 <strong>{selectedRows.length}명</strong>의{" "}
              <strong>{year}년도</strong> 연차 정보를 초기화하시겠습니까?
              <br />
              초기화된 데이터는 복구할 수 없습니다.
            </p>
            <div className={styled.modalActions}>
              <button
                className={`${styled.btn} ${styled.btnOutline}`}
                onClick={() => setShowDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                className={`${styled.btn} ${styled.btnDangerSolid}`}
                onClick={handleDeleteSelected}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
