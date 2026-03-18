import React, { useMemo } from "react";
import clsx from "clsx";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./DeductTab.module.css";

export default function DeductTab({ deductRows, deductForm, setDeductForm, onSave }) {
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

  const deductCols = useMemo(
    () => [
      {
        headerName: "국민연금(%)",
        field: "pensionRate",
        flex: 1,
        minWidth: 110,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "건강보험(%)",
        field: "healthRate",
        flex: 1,
        minWidth: 110,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "고용보험(%)",
        field: "employRate",
        flex: 1,
        minWidth: 110,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "장기요양(%)",
        field: "careRate",
        flex: 1,
        minWidth: 110,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "소득세(%)",
        field: "incomeTaxRate",
        flex: 1,
        minWidth: 100,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "지방세(%)",
        field: "localTaxRate",
        flex: 1,
        minWidth: 100,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
      {
        headerName: "적용일",
        field: "startDtm",
        flex: 1,
        minWidth: 120,
        headerClass: styled.headerCenter,
        cellClass: styled.cellCenter,
      },
    ],
    [],
  );

  
return (
  <div className={styled.verticalWrap}>
    {/* 위: 테이블 (비율 3) */}
    <div className={styled.topGrid}>
      <div className={clsx("ag-theme-alpine", styled.grid)}>
        <AgGridReact
          theme={themeQuartz}
          rowData={deductRows}
          columnDefs={deductCols}
          {...gridDefaults}
          rowSelection={{ mode: "singleRow", enableClickSelection: true }}
          onGridReady={(p) => fitCols(p.api)}
          onFirstDataRendered={(p) => fitCols(p.api)}
          onGridSizeChanged={(p) => fitCols(p.api)}
          onRowClicked={(e) =>
            setDeductForm({
              ...e.data,
              pensionRate: e.data.pensionRate ?? "",
              healthRate: e.data.healthRate ?? "",
              employRate: e.data.employRate ?? "",
              careRate: e.data.careRate ?? "",
              incomeTaxRate: e.data.incomeTaxRate ?? "",
              localTaxRate: e.data.localTaxRate ?? "",
              startDtm: e.data.startDtm ?? "",
            })
          }
        />
      </div>
    </div>

    {/* 아래: 입력 (비율 7) */}
    <div className={styled.bottomForm}>
      <div className={styled.formHeader}>
        <div className={styled.formTitle}>공제율 입력</div>
      </div>

      <div className={styled.formBox}>
        <div className={styled.field}>
          <label>국민연금(%)</label>
          <input
            value={deductForm.pensionRate}
            onChange={(e) => setDeductForm((v) => ({ ...v, pensionRate: e.target.value }))}
          />
        </div>
        <div className={styled.field}>
          <label>건강보험(%)</label>
          <input
            value={deductForm.healthRate}
            onChange={(e) => setDeductForm((v) => ({ ...v, healthRate: e.target.value }))}
          />
        </div>
        <div className={styled.field}>
          <label>고용보험(%)</label>
          <input
            value={deductForm.employRate}
            onChange={(e) => setDeductForm((v) => ({ ...v, employRate: e.target.value }))}
          />
        </div>
        <div className={styled.field}>
          <label>장기요양(%)</label>
          <input
            value={deductForm.careRate}
            onChange={(e) => setDeductForm((v) => ({ ...v, careRate: e.target.value }))}
          />
        </div>
        <div className={styled.field}>
          <label>소득세(%)</label>
          <input
            value={deductForm.incomeTaxRate}
            onChange={(e) => setDeductForm((v) => ({ ...v, incomeTaxRate: e.target.value }))}
          />
        </div>
        <div className={styled.field}>
          <label>지방세(%)</label>
          <input
            value={deductForm.localTaxRate}
            onChange={(e) => setDeductForm((v) => ({ ...v, localTaxRate: e.target.value }))}
          />
        </div>
        <div className={styled.field}>
          <label>적용일</label>
          <input value={deductForm.startDtm} disabled />
        </div>

        <div className={styled.hint}>
          ※ 공제율은 신규 버튼이 없습니다. (데이터가 없으면 INSERT, 있으면 UPDATE/INSERT 로직)
        </div>
      </div>
    </div>
  </div>
);

}
