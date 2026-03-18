import React from 'react';
import styled from './PageHeader.module.css';

const PageHeader = ({ title, subTitle, children }) => {
    return (
        <div className={styled.headerRow}>
            <div className={styled.titleBox}>
                <div className={styled.title}>{title}</div>
                {subTitle && <div className={styled.subTitle}>{subTitle}</div>}
            </div>
            {children && (
                <div className={styled.headerActions}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeader;