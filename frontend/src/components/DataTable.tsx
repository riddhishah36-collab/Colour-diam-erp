import React, { useState } from "react";
import { cn, Loader, EmptyState, SearchInput, Pagination, Button } from "./ui";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  hideOnMobile?: boolean;
  headerClass?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  onPage: (p: number) => void;
  onPageSize: (s: number) => void;
  onSort?: (key: string, dir: "asc" | "desc") => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  searchValue?: string;
  onSearch?: (v: string) => void;
  searchPlaceholder?: string;
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDetail?: string;
  keyField?: string;
  showSearch?: boolean;
  showPagination?: boolean;
  selected?: Set<string>;
  onToggleSelect?: (id: string) => void;
  rowKey?: (row: T) => string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  total,
  page,
  pageSize,
  onPage,
  onPageSize,
  onSort,
  sortKey,
  sortDir,
  searchValue,
  onSearch,
  searchPlaceholder,
  toolbar,
  filters,
  actions,
  onRowClick,
  loading,
  emptyTitle = "Nothing here yet",
  emptyDetail,
  showSearch = true,
  showPagination = true,
  selected,
  onToggleSelect,
  rowKey
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState("");
  const effectiveSearch = searchValue !== undefined ? searchValue : localSearch;
  const effectiveOnSearch = onSearch || setLocalSearch;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-100 shadow-sm">
      {(toolbar || showSearch || actions) && (
        <div className="flex flex-col gap-3 border-b border-ink-100 p-4">
          {(toolbar || actions) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">{toolbar}</div>
              <div className="flex items-center gap-2">{actions}</div>
            </div>
          )}
          {showSearch && (
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={effectiveSearch} onChange={effectiveOnSearch} placeholder={searchPlaceholder} className="w-full sm:w-72" />
              {filters}
            </div>
          )}
        </div>
      )}

      <div className="scrollbar-thin min-h-0 flex-1 overflow-auto">
        {loading ? (
          <Loader />
        ) : rows.length === 0 ? (
          <EmptyState title={emptyTitle} detail={emptyDetail} />
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-ivory/95 backdrop-blur">
              <tr>
                {selected && onToggleSelect && (
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={rows.length > 0 && rows.every((r) => selected.has(rowKey ? rowKey(r) : r.id))}
                      onChange={() => {
                        const all = rows.every((r) => selected.has(rowKey ? rowKey(r) : r.id));
                        rows.forEach((r) => onToggleSelect(rowKey ? rowKey(r) : r.id));
                        void all;
                      }}
                      className="h-4 w-4 rounded accent-gold-600"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500",
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                      col.hideOnMobile && "hidden md:table-cell",
                      col.headerClass
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className={cn(
                          "inline-flex items-center gap-1 hover:text-ink-800",
                          sortKey === col.key && "text-ink-900"
                        )}
                        onClick={() => onSort && onSort(col.key, sortKey === col.key && sortDir === "asc" ? "desc" : "asc")}
                      >
                        {col.header}
                        {sortKey === col.key && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            {sortDir === "asc" ? (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            )}
                          </svg>
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {rows.map((row) => {
                const id = rowKey ? rowKey(row) : row.id;
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-gold-50/60",
                      selected?.has(id) && "bg-gold-50"
                    )}
                  >
                    {selected && onToggleSelect && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(id)}
                          onChange={() => onToggleSelect(id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded accent-gold-600"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "max-w-72 truncate px-4 py-3 text-ink-800",
                          col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                          col.hideOnMobile && "hidden md:table-cell"
                        )}
                      >
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showPagination && !loading && total > 0 && (
        <Pagination total={total} page={page} pageSize={pageSize} onPage={onPage} onPageSize={onPageSize} />
      )}
    </div>
  );
}
