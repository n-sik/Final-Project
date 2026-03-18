import React from "react";
import clsx from "clsx";
import { Plus, Save } from "lucide-react";

import styled from "./SalaryManageHeader.module.css";

export default function SalaryManageHeader({
    activeTab,
    onSaveEmp,
    onNewMaster,
    onSaveStep,
    onSaveBase,
    onSaveAllowDef,
    onSaveDeduct,
}) {
    return (
        <div className={styled.headerRow}>
            <div className={styled.titleBox}>
                <div className={styled.title}>급여 관리</div>
                <div className={styled.subTitle}>사원별 기준금액/수당 및 마스터 관리</div>
            </div>

            <div className={styled.headerActions}>
                {activeTab === "EMP" && (
                    <button
                        className={clsx(styled.btn, styled.btnPrimary)}
                        onClick={onSaveEmp}
                    >
                        <Save size={16} /> 저장
                    </button>
                )}

                {activeTab !== "EMP" && (
                    <button
                        className={clsx(styled.btn, styled.btnGhost)}
                        onClick={onNewMaster}
                        title="신규 입력"
                    >
                        <Plus size={16} /> 신규
                    </button>
                )}

                {activeTab === "STEP" && (
                    <button
                        className={clsx(styled.btn, styled.btnPrimary)}
                        onClick={onSaveStep}
                    >
                        <Save size={16} /> 호봉가산율 저장
                    </button>
                )}

                {activeTab === "BASE" && (
                    <button
                        className={clsx(styled.btn, styled.btnPrimary)}
                        onClick={onSaveBase}
                    >
                        <Save size={16} /> 저장
                    </button>
                )}

                {activeTab === "ALLOW" && (
                    <button
                        className={clsx(styled.btn, styled.btnPrimary)}
                        onClick={onSaveAllowDef}
                    >
                        <Save size={16} /> 저장
                    </button>
                )}

                {activeTab === "DEDUCT" && (
                    <button
                        className={clsx(styled.btn, styled.btnPrimary)}
                        onClick={onSaveDeduct}
                    >
                        <Save size={16} /> 저장
                    </button>
                )}
            </div>
        </div>
    );
}
