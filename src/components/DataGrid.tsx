import React, { useEffect, useMemo, useState } from "react";
import { ColumnDef, SortingState, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { exportGridToExcel, exportGridToPdf, GridExportColumn, GridExportRow } from "@/components/gridExport";

export type DataGridToolbarAction = "excel" | "pdf";

export interface DataGridCustomToolbarAction {
  id: string;
  label: string;
  onClick: () => void;
  align?: "left" | "right";
}

export interface DataGridExportOptions<TData extends object> {
  title: string;
  fileNamePrefix: string;
  orientation?: "portrait" | "landscape";
  columns?: GridExportColumn[];
  mapRow?: (row: TData) => GridExportRow;
}

export interface DataGridColumn<TData extends object> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof TData & string;
  accessorFn?: (row: TData) => unknown;
  cell?: (row: TData) => React.ReactNode;
  enableSorting?: boolean;
  enableColumnFilter?: boolean;
  sortingFn?: (left: TData, right: TData) => number;
  exportValue?: (row: TData) => unknown;
  exportHeader?: string;
  exportable?: boolean;
}

export interface DataGridProps<TData extends object> {
  id: string;
  data: TData[];
  columns: DataGridColumn<TData>[];
  toolbarActions?: Array<DataGridToolbarAction | DataGridCustomToolbarAction>;
  exportOptions?: DataGridExportOptions<TData>;
  pageSizeOptions?: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

const toFilterValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item))
      .join(" ")
      .toLowerCase();
  }

  return String(value).toLowerCase();
};

const isCustomAction = (action: DataGridToolbarAction | DataGridCustomToolbarAction): action is DataGridCustomToolbarAction => {
  return typeof action !== "string";
};

const toHeaderText = (column: DataGridColumn<object>): string => {
  if (typeof column.header === "string") {
    return column.header;
  }

  return column.exportHeader ?? column.id;
};

const toColumnPlaceholder = (columnId: string): string => {
  const spaced = columnId
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();

  if (spaced.length === 0) {
    return "";
  }

  return spaced
    .split(/\s+/)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
};

const buildExportColumns = <TData extends object>(columns: DataGridColumn<TData>[]): GridExportColumn[] => {
  return columns
    .filter((column) => column.exportable !== false)
    .map((column) => {
      const exportColumn: GridExportColumn = {
        key: column.id,
        header: toHeaderText(column as unknown as DataGridColumn<object>),
      };

      if (column.exportValue) {
        exportColumn.exportValue = (row) => column.exportValue?.(row as unknown as TData);
      } else if (column.accessorFn) {
        exportColumn.exportValue = (row) => column.accessorFn?.(row as unknown as TData);
      } else if (column.accessorKey) {
        exportColumn.exportValue = (row) => (row as unknown as Record<string, unknown>)[column.accessorKey];
      }

      return exportColumn;
    })
    .filter((column) => typeof column.exportValue === "function");
};

export const DataGrid = <TData extends object>({ id, data, columns, toolbarActions = [], exportOptions, pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS }: DataGridProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? DEFAULT_PAGE_SIZE_OPTIONS[0]);
  const [exportFeedback, setExportFeedback] = useState("");

  useEffect(() => {
    const initialPageSize = pageSizeOptions[0] ?? DEFAULT_PAGE_SIZE_OPTIONS[0];
    setPageSize(initialPageSize);
    setPageIndex(0);
  }, [pageSizeOptions]);

  const filterableColumns = useMemo(() => {
    return columns.filter((column) => {
      if (column.enableColumnFilter === false) {
        return false;
      }

      return typeof column.accessorFn === "function" || Boolean(column.accessorKey);
    });
  }, [columns]);

  const filteredData = useMemo(() => {
    const globalNeedle = globalFilter.trim().toLowerCase();

    return data.filter((row) => {
      const matchesGlobal =
        globalNeedle.length === 0 ||
        filterableColumns.some((column) => {
          const rawValue = column.accessorFn ? column.accessorFn(row) : column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : "";
          return toFilterValue(rawValue).includes(globalNeedle);
        });

      if (!matchesGlobal) {
        return false;
      }

      return Object.entries(columnFilters).every(([columnId, needle]) => {
        const normalizedNeedle = needle.trim().toLowerCase();
        if (normalizedNeedle.length === 0) {
          return true;
        }

        const column = filterableColumns.find((item) => item.id === columnId);
        if (!column) {
          return true;
        }

        const rawValue = column.accessorFn ? column.accessorFn(row) : column.accessorKey ? (row as Record<string, unknown>)[column.accessorKey] : "";
        return toFilterValue(rawValue).includes(normalizedNeedle);
      });
    });
  }, [columnFilters, data, filterableColumns, globalFilter]);

  const tableColumns = useMemo(() => {
    return columns.map((column) => {
      const result: ColumnDef<TData> = {
        id: column.id,
        header: () => column.header,
        enableSorting: column.enableSorting ?? false,
      };

      if (column.cell) {
        result.cell = (info) => column.cell?.(info.row.original);
      }

      if (column.accessorFn) {
        result.accessorFn = column.accessorFn;
      } else if (column.accessorKey) {
        result.accessorKey = column.accessorKey;
      }

      if (!column.cell) {
        result.cell = (info) => String(info.getValue() ?? "");
      }

      if (column.sortingFn) {
        result.sortingFn = (rowA, rowB) => column.sortingFn?.(rowA.original, rowB.original) ?? 0;
      }

      return result;
    });
  }, [columns]);

  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sortedRows = table.getRowModel().rows;
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  useEffect(() => {
    if (pageIndex > pageCount - 1) {
      setPageIndex(Math.max(pageCount - 1, 0));
    }
  }, [pageCount, pageIndex]);

  const pagedRows = useMemo(() => {
    const start = pageIndex * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [pageIndex, pageSize, sortedRows]);

  const resolvedExportColumns = useMemo(() => {
    if (!exportOptions) {
      return [];
    }

    return exportOptions.columns ?? buildExportColumns(columns);
  }, [columns, exportOptions]);

  const mappedRows = useMemo(() => {
    if (!exportOptions) {
      return [];
    }

    if (exportOptions.mapRow) {
      return data.map((row) => exportOptions.mapRow?.(row) ?? {});
    }

    return data as unknown as GridExportRow[];
  }, [data, exportOptions]);

  const handleExcelExport = () => {
    if (!exportOptions) {
      return;
    }

    try {
      exportGridToExcel({
        fileName: `${exportOptions.fileNamePrefix}.xlsx`,
        title: exportOptions.title,
        rows: mappedRows,
        columns: resolvedExportColumns,
      });
      setExportFeedback("Excel export complete");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setExportFeedback(`Excel export failed: ${message}`);
    }
  };

  const handlePdfExport = () => {
    if (!exportOptions) {
      return;
    }

    try {
      exportGridToPdf({
        fileName: `${exportOptions.fileNamePrefix}.pdf`,
        title: exportOptions.title,
        rows: mappedRows,
        columns: resolvedExportColumns,
        orientation: exportOptions.orientation,
      });
      setExportFeedback("PDF export complete");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setExportFeedback(`PDF export failed: ${message}`);
    }
  };

  const leftActions = toolbarActions.filter((action) => !isCustomAction(action) || action.align !== "right");
  const rightActions = toolbarActions.filter((action) => isCustomAction(action) && action.align === "right") as DataGridCustomToolbarAction[];

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(event.target.value);
    setPageIndex(0);
  };

  const handleGlobalFilterInput = (event: React.FormEvent<HTMLInputElement>) => {
    setGlobalFilter(event.currentTarget.value);
    setPageIndex(0);
  };

  const handleColumnFilterChange = (columnId: string, value: string) => {
    setColumnFilters((current) => ({
      ...current,
      [columnId]: value,
    }));
    setPageIndex(0);
  };

  const handlePreviousPage = () => {
    setPageIndex((current) => Math.max(current - 1, 0));
  };

  const handleNextPage = () => {
    setPageIndex((current) => Math.min(current + 1, pageCount - 1));
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setPageIndex(0);
  };

  return (
    <div id={id} className="data-grid-container">
      <div className="data-grid-filters" aria-label="Data grid filters">
        <label htmlFor={`${id}-global-filter`} className="data-grid-filter-label">
          Search all columns
        </label>
        <input id={`${id}-global-filter`} data-grid-global-filter="true" className="summit-form-input" type="text" value={globalFilter} onChange={handleGlobalFilterChange} onInput={handleGlobalFilterInput} placeholder="Filter rows..." />
      </div>

      {(toolbarActions.length > 0 || rightActions.length > 0) && (
        <div className="data-grid-toolbar" style={{ marginBottom: 8 }}>
          {leftActions.map((action) => {
            if (action === "excel") {
              return (
                <button key="excel" type="button" data-action="excel-export" className="summit-button summit-button-secondary" onClick={handleExcelExport}>
                  Excel Export
                </button>
              );
            }

            if (action === "pdf") {
              return (
                <button key="pdf" type="button" data-action="pdf-export" className="summit-button summit-button-secondary" onClick={handlePdfExport}>
                  PDF Export
                </button>
              );
            }

            return (
              <button key={action.id} type="button" data-action={action.id} className="summit-button summit-button-secondary" onClick={action.onClick}>
                {action.label}
              </button>
            );
          })}

          {rightActions.length > 0 && <div style={{ marginLeft: "auto" }} />}

          {rightActions.map((action) => (
            <button key={action.id} type="button" data-action={action.id} className="summit-button summit-button-secondary" onClick={action.onClick}>
              {action.label}
            </button>
          ))}
        </div>
      )}

      {exportFeedback && (
        <div data-grid-export-feedback="true" role="status" className="data-grid-export-feedback">
          {exportFeedback}
        </div>
      )}

      <table className="data-grid-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sortState = header.column.getIsSorted();
                const ariaSort = sortState === "asc" ? "ascending" : sortState === "desc" ? "descending" : "none";

                return (
                  <th key={header.id} aria-sort={canSort ? ariaSort : undefined}>
                    {canSort ? (
                      <button
                        type="button"
                        className="summit-button summit-button-secondary"
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by ${String(header.column.columnDef.header)}, currently ${sortState === "asc" ? "ascending" : sortState === "desc" ? "descending" : "not sorted"}`}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span data-grid-sort-indicator={header.id} className="data-grid-sort-indicator">
                          {sortState === "asc" ? " ▲" : sortState === "desc" ? " ▼" : " ↕"}
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
          {filterableColumns.length > 0 && (
            <tr>
              {table.getAllLeafColumns().map((leafColumn) => {
                const dataGridColumn = columns.find((column) => column.id === leafColumn.id);
                const canFilter = Boolean(dataGridColumn) && dataGridColumn?.enableColumnFilter !== false && (Boolean(dataGridColumn?.accessorKey) || Boolean(dataGridColumn?.accessorFn));

                return (
                  <th key={`${leafColumn.id}-filter`}>
                    {canFilter ? (
                      <input
                        type="text"
                        className="summit-form-input"
                        placeholder={toColumnPlaceholder(leafColumn.id)}
                        data-grid-column-filter={leafColumn.id}
                        value={columnFilters[leafColumn.id] ?? ""}
                        onChange={(event) => handleColumnFilterChange(leafColumn.id, event.target.value)}
                        onInput={(event) => handleColumnFilterChange(leafColumn.id, event.currentTarget.value)}
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          )}
        </thead>
        <tbody>
          {pagedRows.length === 0 ? (
            <tr>
              <td colSpan={Math.max(table.getAllLeafColumns().length, 1)} data-grid-empty-state="true">
                No rows to display
              </td>
            </tr>
          ) : (
            pagedRows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="data-grid-pagination" aria-label="Data grid pagination">
        <button type="button" data-grid-page="previous" className="summit-button summit-button-secondary" onClick={handlePreviousPage} disabled={pageIndex === 0}>
          Previous
        </button>
        <span data-grid-page-indicator="true">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <button type="button" data-grid-page="next" className="summit-button summit-button-secondary" onClick={handleNextPage} disabled={pageIndex >= pageCount - 1}>
          Next
        </button>
        <label htmlFor={`${id}-page-size`} className="data-grid-filter-label">
          Rows per page
        </label>
        <select id={`${id}-page-size`} data-grid-page-size="true" className="summit-form-input" value={String(pageSize)} onChange={handlePageSizeChange}>
          {pageSizeOptions.map((option) => (
            <option key={option} value={String(option)}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
