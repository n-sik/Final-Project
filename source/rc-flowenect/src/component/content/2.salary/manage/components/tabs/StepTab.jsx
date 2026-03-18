import React, { useMemo } from "react";
import clsx from "clsx";
import { Save } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./StepTab.module.css";

export default function StepTab({
  stepRates,
  setStepRates,
  selectedStepIdx,
  setSelectedStepIdx,
  stepForm,
  setStepForm,
  onApply,
  onDelete,
  onOpenHistory,
}) {
  const fitCols = (api) => {
    try {
      api.sizeColumnsToFit();
      requestAnimationFrame(() => api.sizeColumnsToFit());
    } catch {
      // no-op
    }
  };

  const gridDefaults = useMemo(
    () => ({
      defaultColDef: {
        resizable: false,
        sortable: true,
        suppressMovable: true,
      },
      suppressCellFocus: true,
    }),
    [],
  );

  const stepCols = useMemo(
    () => [
      {
        headerName: "호봉",
        field: "salaryStep",
        flex: 1,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "가산율(%)",
        field: "increaseRate",
        flex: 1,
        headerClass: styled.headerRight,
        cellClass: styled.cellRight,
      },
      {
        headerName: "사용여부",
        field: "useYn",
        flex: 1,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "적용일",
        field: "startDtm",
        flex: 1,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },

{
  headerName: "이력",
  field: "history",
  flex: 0.6,
  headerClass: styled.headerCenter,
  cellClass: styled.cellCenter,
  cellRenderer: (p) => (
    <button
      type="button"
      className={styled.historyBtn}
      title="호봉 이력"
      onClick={(e) => {
        e.stopPropagation();
        onOpenHistory?.(p.data?.salaryStep);
      }}
    >
      <i className="bi bi-info-circle" />
    </button>
  ),
},
    ],
    [],
  );

  return (
    <div className={styled.innerSplit}>
      <div className={styled.innerLeft}>
        <div className={clsx("ag-theme-alpine", styled.grid)}>
          <AgGridReact
            theme={themeQuartz}
            rowData={stepRates}
            columnDefs={stepCols}
            {...gridDefaults}
            rowSelection={{ mode: "singleRow", enableClickSelection: true }}
            onGridReady={(p) => fitCols(p.api)}
            onFirstDataRendered={(p) => fitCols(p.api)}
            onGridSizeChanged={(p) => fitCols(p.api)}
            onRowClicked={(e) => {
              const idx = e.rowIndex;
              setSelectedStepIdx(idx);
              setStepForm({
                salaryStep: e.data?.salaryStep ?? "",
                increaseRate: e.data?.increaseRate ?? "",
                useYn: e.data?.useYn ?? "Y",
              });
            }}
          />
        </div>
      </div>

      <div className={styled.innerRight}>
        <div className={styled.sectionTitleRow}>
          <div className={styled.sectionTitle}>호봉 입력/수정</div>
</div>
        <div className={styled.formBox}>
          <div className={styled.formRow}>
            <label>호봉</label>
            <input
              value={stepForm.salaryStep}
              onChange={(e) =>
                setStepForm((v) => ({
                  ...v,
                  salaryStep: e.target.value,
                }))
              }
              placeholder="예) 1"
            />
          </div>
          <div className={styled.formRow}>
            <label>가산율(%)</label>
            <input
              value={stepForm.increaseRate}
              onChange={(e) =>
                setStepForm((v) => ({
                  ...v,
                  increaseRate: e.target.value,
                }))
              }
              placeholder="예) 2.5"
            />
          </div>
          <div className={styled.formRow}>
            <label>사용여부</label>
            <select
              value={stepForm.useYn}
              onChange={(e) =>
                setStepForm((v) => ({
                  ...v,
                  useYn: e.target.value,
                }))
              }
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </select>
          </div>

          <div className={styled.inlineActions}>
            <button className={clsx(styled.btn, styled.btnPrimary)} onClick={onApply}>
              <Save size={16} /> 적용
            </button>
            <button className={clsx(styled.btn, styled.btnDanger)} onClick={onDelete}>
              삭제
            </button>
          </div>

          <div className={styled.hint}>
            ※ 저장 기준은 "오늘"입니다. (오늘 수정하면 UPDATE, 다른 날 수정하면 이력이 누적됩니다.)
          </div>
          {selectedStepIdx !== null && selectedStepIdx !== undefined && (
            <div className={styled.hint}>선택 행: {selectedStepIdx + 1}</div>
          )}
        </div>
      </div>
    </div>
  );
}
