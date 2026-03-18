import React from "react";
import clsx from "clsx";

import styled from "./SalaryManageLeftPanel.module.css";

export default function SalaryManageLeftPanel({
    tabs,
    activeTab,
    onChangeTab,
    children,
}) {
    return (
        <div className={styled.leftPanel}>
            <div className={styled.tabsBar}>
                <div className={styled.tabs}>
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            className={clsx(
                                styled.tabBtn,
                                activeTab === t.key && styled.tabBtnActive,
                            )}
                            onClick={() => onChangeTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styled.panelBody}>{children}</div>
        </div>
    );
}
