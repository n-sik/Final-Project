import React from 'react';
import { X, Calendar, User, Tag, FileText } from 'lucide-react';
import styles from "../ProjectPerformance.module.css";

const ProjectDetailModal = ({ project, onClose }) => {
  if (!project) return null;

  const formatOnlyDate = (dateStr) => {
  if (!dateStr) return "-";
  return dateStr.split('T')[0].split(' ')[0];
};

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className={styles.modalHeader}>
          <h2>프로젝트 상세 정보</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 바디 */}
        <div className={styles.modalBody}>
          <div className={styles.mainInfo}>
            <span className={`${styles.badge} ${styles[project.projectStatCd]}`}>
              {project.projectStatCd === 'ING' ? '진행중' : project.projectStatCd === 'END' ? '완료' : '지연'}
            </span>
            <h1 className={styles.projectTitle}>{project.projectNm}</h1>
            <p className={styles.projectNo}>{project.projectNo}</p>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.label}><User size={16} /> 담당부서</div>
              <div className={styles.value}>{project.deptNm || '미지정'}</div>
            </div>
           <div className={styles.infoItem}>
  <div className={styles.label}><Calendar size={14} /> 프로젝트 기간</div>
  <div className={styles.value}>
    {formatOnlyDate(project.startDtm)} - {formatOnlyDate(project.endDtm)}
  </div>
</div>
          </div>

          <div className={styles.descriptionBox}>
            <div className={styles.label}><FileText size={16} /> 프로젝트 설명</div>
            <p className={styles.descriptionText}>
              {project.projectDesc || '등록된 설명이 없습니다.'}
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className={styles.modalFooter}>
          <button className={styles.confirmBtn} onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;