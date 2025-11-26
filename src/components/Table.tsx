import React from 'react';
import '../styles/Table.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  customActions?: (item: T) => React.ReactNode;
  loading?: boolean;
}

export function Table<T extends Record<string, any> & { id?: string | number }>({
  data,
  columns,
  onView,
  onEdit,
  onDelete,
  customActions,
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return <div className="table-loading">Loading...</div>;
  }

  if (data.length === 0) {
    return <div className="table-empty">No data available</div>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
            {(onView || onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id ?? index}>
              {columns.map((column) => (
                <td key={column.key} data-label={column.header}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {(onView || onEdit || onDelete) && (
                <td className="table-actions" data-label="Actions">
                  {onView && (
                    <button className="btn-view" onClick={() => onView(item)}>
                      View
                    </button>
                  )}
                  {onEdit && (
                    <button className="btn-edit" onClick={() => onEdit(item)}>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button className="btn-delete" onClick={() => onDelete(item)}>
                      Delete
                    </button>
                  )}
                  {customActions && customActions(item)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
