import React, { useMemo } from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./PosBaseAmtHistoryModal.module.css";

export default function PosBaseAmtHistoryModal({ open, onClose, pos, rows }) {
  const cols = useMemo(
    () => [
      { headerName: "적용일", field: "startDtm", width: 140 },
      { headerName: "종료일", field: "endDtm", width: 140 },
      { headerName: "기준금액", field: "stdAmt", flex: 1, minWidth: 140 },
    ],
    [],
  );

  if (!open) return null;

  return (
    <div className={styled.backdrop} onMouseDown={onClose}>
      <div className={styled.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styled.header}>
          <div className={styled.title}>
            직위별 기준금액 이력 {pos?.posNm ? `- ${pos.posNm}` : ""}
          </div>
          <button className={styled.iconBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styled.body}>
          <div className={clsx("ag-theme-alpine", styled.grid)}>
            <AgGridReact
              theme={themeQuartz}
              rowData={rows || []}
              columnDefs={cols}
              suppressCellFocus
              defaultColDef={{ resizable: false, sortable: true, suppressMovable: true }}
            />
          </div>
          <div className={styled.hint}>※ 이력은 조회 전용이며 수정할 수 없습니다.</div>
        </div>

        <div className={styled.footer}>
          <button className={clsx(styled.btn, styled.btnGhost)} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
