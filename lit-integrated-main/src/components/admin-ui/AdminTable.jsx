import React from "react";
import AdminEmptyState from "./AdminEmptyState";
import { AdminSkeletonTable } from "./AdminSkeleton";

export default function AdminTable({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  emptyIcon = null,
  onRowClick,
  selectedRowId,
  stickyHeader = true,
  className = "",
  toolbar = null,
  footer = null,
  getRowKey = (row, index) => row.id ?? index,
  renderCell,
}) {
  if (loading) {
    return (
      <div className={`adm-table-wrap w-full min-w-0 max-w-full overflow-hidden ${className}`.trim()}>
        {toolbar}
        <AdminSkeletonTable columns={columns.length || 5} rows={6} />
      </div>
    );
  }

  return (
    <div className={`adm-table-wrap w-full min-w-0 max-w-full overflow-hidden ${className}`.trim()}>
      {toolbar}
      <div className="adm-table-scroll w-full max-w-full overflow-x-auto overscroll-x-contain">
        <table className={`adm-table min-w-full w-max border-collapse text-sm ${stickyHeader ? "adm-table--sticky [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-[2]" : ""}`.trim()}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <AdminEmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    compact
                  />
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const rowKey = getRowKey(row, index);
                const isSelected = selectedRowId && selectedRowId === rowKey;
                return (
                  <tr
                    key={rowKey}
                    className={[
                      onRowClick ? "adm-table__row--clickable" : "",
                      isSelected ? "adm-table__row--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={
                      onRowClick
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              onRowClick(row);
                            }
                          }
                        : undefined
                    }
                  >
                    {columns.map((column) => (
                      <td key={column.key}>
                        {renderCell
                          ? renderCell(row, column)
                          : column.render
                            ? column.render(row)
                            : row[column.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
}
