import React from 'react';
import '../styles/ResourceList.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const goToPrevious = () => onPageChange(Math.max(1, currentPage - 1));
  const goToNext = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className={`pagination${className ? ` ${className}` : ''}`}>
      <button className="btn-secondary" onClick={goToPrevious} disabled={currentPage === 1}>
        Previous
      </button>
      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="btn-secondary"
        onClick={goToNext}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};
