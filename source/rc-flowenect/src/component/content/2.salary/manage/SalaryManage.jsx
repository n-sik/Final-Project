import React from "react";

import layout from "./SalaryManageLayout.module.css";
import AllowancePickerModal from "./modal/AllowancePickerModal";
import EmpPayInfoHistoryModal from "./modal/EmpPayInfoHistoryModal";
import PosBaseAmtHistoryModal from "./modal/PosBaseAmtHistoryModal";
import StepRateHistoryModal from "./modal/StepRateHistoryModal";

import useSalaryManageController from "./hooks/useSalaryManageController";

import SalaryManageHeader from "./components/header/SalaryManageHeader";
import SalaryManageLeftPanel from "./components/left/SalaryManageLeftPanel";
import SalaryManageRightPanel from "./components/right/SalaryManageRightPanel";

import EmpTab from "./components/tabs/EmpTab";
import BaseTab from "./components/tabs/BaseTab";
import StepTab from "./components/tabs/StepTab";
import AllowTab from "./components/tabs/AllowTab";
import DeductTab from "./components/tabs/DeductTab";

const LEFT_TABS = [
    { key: "EMP", label: "사원별 기준금액" },
    { key: "BASE", label: "직위별 기준금액설정" },
    { key: "STEP", label: "호봉 가산율" },
    { key: "ALLOW", label: "수당정의" },
    { key: "DEDUCT", label: "공제율" },
];

export default function SalaryManage() {
    const ctrl = useSalaryManageController();

    return (
        <div className={layout.wrap}>
            <SalaryManageHeader
                activeTab={ctrl.activeTab}
                onSaveEmp={ctrl.saveEmpRight}
                onNewMaster={ctrl.onNewMaster}
                onSaveStep={ctrl.saveStepRates}
                onSaveBase={ctrl.savePosBaseAmt}
                onSaveAllowDef={ctrl.upsertAllowanceDef}
                onSaveDeduct={ctrl.upsertDeduct}
            />

            <div
                className={
                    ctrl.showRight
                        ? layout.contentSplit
                        : `${layout.contentSplit} ${layout.contentSplitOneCol}`
                }
            >
                <SalaryManageLeftPanel
                    tabs={LEFT_TABS}
                    activeTab={ctrl.activeTab}
                    onChangeTab={ctrl.onChangeTab}
                >
                    {ctrl.activeTab === "EMP" && (
                        <EmpTab
                            empRows={ctrl.empRows}
                            onSelectEmp={ctrl.onSelectEmp}
                            onOpenHistory={ctrl.openEmpBaseHistory}
                        />
                    )}
                    {ctrl.activeTab === "BASE" && (
                        <BaseTab
                            gradeBaseAmtRows={ctrl.gradeBaseAmtRows}
                            posList={ctrl.posList}
                            selectedPos={ctrl.selectedPos}
                            setSelectedPos={ctrl.setSelectedPos}
                            posBaseAmtForm={ctrl.posBaseAmtForm}
                            setPosBaseAmtForm={ctrl.setPosBaseAmtForm}
                            loadPosBaseAmt={ctrl.loadPosBaseAmt}
                            onOpenHistory={ctrl.openPosBaseHistory}
                        />
                    )}
                    {ctrl.activeTab === "STEP" && (
                        <StepTab
                            stepRates={ctrl.stepRates}
                            setStepRates={ctrl.setStepRates}
                            selectedStepIdx={ctrl.selectedStepIdx}
                            setSelectedStepIdx={ctrl.setSelectedStepIdx}
                            stepForm={ctrl.stepForm}
                            setStepForm={ctrl.setStepForm}
                            onApply={ctrl.upsertStepFromForm}
                            onDelete={ctrl.deleteSelectedStep}
                            onOpenHistory={ctrl.openStepHistory}
                        />
                    )}
                    {ctrl.activeTab === "ALLOW" && (
                        <AllowTab
                            allowDefRows={ctrl.allowDefRows}
                            allowDefForm={ctrl.allowDefForm}
                            setAllowDefForm={ctrl.setAllowDefForm}
                        />
                    )}
                    {ctrl.activeTab === "DEDUCT" && (
                        <DeductTab
                            deductRows={ctrl.deductRows}
                            deductForm={ctrl.deductForm}
                            setDeductForm={ctrl.setDeductForm}
                            onSave={ctrl.upsertDeduct}
                        />
                    )}
                </SalaryManageLeftPanel>

                {ctrl.showRight && (
                    <SalaryManageRightPanel
                        selectedEmp={ctrl.selectedEmp}
                        empPayInfo={ctrl.empPayInfo}
                        setEmpPayInfo={ctrl.setEmpPayInfo}
                        empAllowances={ctrl.empAllowances}
                        setEmpAllowances={ctrl.setEmpAllowances}
                        onOpenAllowanceModal={() => ctrl.setAllowModalOpen(true)}
                    />
                )}
            </div>

            <AllowancePickerModal
                open={ctrl.allowModalOpen}
                onClose={() => ctrl.setAllowModalOpen(false)}
                onApply={ctrl.applyPickedAllowances}
            />

                        <PosBaseAmtHistoryModal
                open={ctrl.posBaseHistoryOpen}
                onClose={() => ctrl.setPosBaseHistoryOpen(false)}
                pos={ctrl.posBaseHistoryPos}
                rows={ctrl.posBaseHistoryRows}
            />

            <EmpPayInfoHistoryModal
                open={ctrl.empBaseHistoryOpen}
                onClose={() => ctrl.setEmpBaseHistoryOpen(false)}
                emp={ctrl.empBaseHistoryEmp}
                rows={ctrl.empBaseHistoryRows}
            />

            <StepRateHistoryModal
                open={ctrl.stepHistoryOpen}
                onClose={() => ctrl.setStepHistoryOpen(false)}
                salaryStep={ctrl.stepHistoryStep}
                rows={ctrl.stepHistoryRows}
            />
        </div>
    );
}
