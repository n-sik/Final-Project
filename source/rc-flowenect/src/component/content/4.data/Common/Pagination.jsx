import React from 'react';
import styled from './Pagination.module.css';

const Pagination = ({ paging, currentPage, onPageChange }) => {
  // paging 객체나 데이터가 없으면 렌더링 안 함
  if (!paging || paging.totalPageCount <= 1) return null;

  const { startPage, endPage, totalPageCount } = paging; 
  
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className={styled.paginationContainer}>
      <ul className={styled.paginationList}>
        {/* ◀ 이전 버튼: 현재 페이지에서 -1 */}
        <li>
          <button
            className={styled.navButton}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1} // 1페이지면 비활성화
            aria-label="Previous page"
          >
            &lt;
          </button>
        </li>

        {/* 페이지 번호 버튼들 */}
        {pageNumbers.map((num) => (
          <li key={num}>
            <button
              className={`${styled.pageButton} ${currentPage === num ? styled.active : ''}`}
              onClick={() => onPageChange(num)}
            >
              {num}
            </button>
          </li>
        ))}

        {/* ▶ 다음 버튼: 현재 페이지에서 +1 */}
        <li>
          <button
            className={styled.navButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPageCount} // 마지막 페이지면 비활성화
            aria-label="Next page"
          >
            &gt;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;