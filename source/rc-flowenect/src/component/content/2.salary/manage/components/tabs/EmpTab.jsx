import React, { useMemo } from "react";
import clsx from "clsx";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import styled from "./EmpTab.module.css";

export default function EmpTab({ empRows, onSelectEmp, onOpenHistory }) {
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

    const empColDefs = useMemo(
        () => [
            { headerName: "사원명", field: "empNm", flex: 1 },
            { headerName: "직위", field: "posNm", flex: 0.5 },
            { headerName: "부서", field: "deptNm", flex: 1 },
            { headerName: "기준금", field: "baseAmt", flex: 1 },
            {
                headerName: "상태",
                field: "registerStatus",
                flex: 1.2,
                comparator: (valueA, valueB, nodeA, nodeB) => {
                    const a = nodeA?.data?.unregistered ? 0 : 1;
                    const b = nodeB?.data?.unregistered ? 0 : 1;
                    return a - b;
                },
                sort: "asc",
                cellRenderer: (p) => {
                    const unregistered = !!p.data?.unregistered;
                    return (
                        <div className={styled.baseAmtCell}>
                            <span
                                className={clsx(
                                    styled.dot,
                                    unregistered ? styled.dotNo : styled.dotOk,
                                )}
                            />
                            <span className={clsx(styled.baseAmtText, unregistered && styled.unregisteredText)}>
                                {unregistered ? "미등록" : "등록"}
                            </span>
                        </div>
                    );
                },
            },
            {
                headerName: "이력정보",
                field: "history",
                flex: 0.5,
                cellRenderer: (p) => {
                    const ok = !p.data?.unregistered;
                    if (!ok) return null;

                    return (
                        <button
                            type="button"
                            className={styled.historyBtn}
                            title="개인 기준금액 이력"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenHistory?.(p.data);
                            }}
                        >
                            <i className="bi bi-info-circle" />
                        </button>
                    );
                },
            },
        ],
        [onOpenHistory],
    );

    return (
        <div className={clsx("ag-theme-alpine", styled.grid)}>
            <AgGridReact
                theme={themeQuartz}
                rowData={empRows}
                columnDefs={empColDefs}
                {...gridDefaults}
                rowSelection={{
                    mode: "singleRow",
                    checkboxes: false,
                    enableClickSelection: true,
                }}
                onRowClicked={(e) => onSelectEmp(e.data)}
            />
        </div>
    );
}
