import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { X, Check } from "lucide-react";
import apiClient from "../../../../../api/apiClient";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./AllowancePickerModal.module.css";

export default function AllowancePickerModal({ open, onClose, onApply }) {
  const [rows, setRows] = useState([]);
  const [picked, setPicked] = useState([]);

  const cols = useMemo(
    () => [
            { headerName: "수당명", field: "salaryItemName", flex: 1, minWidth: 160 },
      { headerName: "구분", field: "itemType", flex: 0.7, minWidth: 90 },
      { headerName: "과세", field: "taxType", flex: 0.7, minWidth: 90 },
    ],
    [],
  );

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await apiClient.get("/api/payroll/allowance-def");
      // 사원별 수당은 '지급'만 선택(공제는 공제율에서 계산/관리)
      const filtered = (data || []).filter((d) => d.itemType === "지급");
      setRows(filtered);
      setPicked([]);
    })();
  }, [open]);

  if (!open) return null;

  return (
    <div className={styled.backdrop} onMouseDown={onClose}>
      <div className={styled.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styled.modalHeader}>
          <div className={styled.modalTitle}>수당 추가</div>
          <button className={styled.iconBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styled.modalBody}>
          <div className={styled.split}>
            <div className={styled.left}>
              <div className={styled.sectionTitle}>수당정의 목록</div>
              <div className={clsx("ag-theme-alpine", styled.grid)}>
                <AgGridReact
                  theme={themeQuartz}
                  rowData={rows}
                  columnDefs={cols}
                  rowSelection={{ mode: "multiRow" }}
                  onSelectionChanged={(e) => setPicked(e.api.getSelectedRows())}
                  suppressCellFocus
                />
              </div>
            </div>

            <div className={styled.right}>
              <div className={styled.sectionTitle}>선택한 수당</div>
              <div className={styled.pickedList}>
                {picked.length === 0 ? (
                  <div className={styled.empty}>왼쪽에서 수당을 선택하세요.</div>
                ) : (
                  picked.map((p) => (
                    <div key={p.salaryItemCode} className={styled.pickedItem}>
                      <div className={styled.pickedName}>{p.salaryItemName}</div>
                      <div className={styled.pickedCode}>{p.salaryItemCode}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styled.modalFooter}>
          <button className={clsx(styled.btn, styled.btnGhost)} onClick={onClose}>
            취소
          </button>
          <button
            className={clsx(styled.btn, styled.btnPrimary)}
            onClick={() => {
              onApply?.(picked);
              onClose?.();
            }}
          >
            <Check size={16} /> 적용
          </button>
        </div>
      </div>
    </div>
  );
}
