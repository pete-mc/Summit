import React, { useEffect, useMemo, useRef, useState } from "react";
import { DataGrid, DataGridColumn } from "@/components/DataGrid";
import { exportElementToPdf } from "@/components/gridExport";
import { OASProgressionRow } from "@/pages/OasProgression/services/buildOASProgressionRows";
import { OASHeatMap } from "@/pages/OasProgression/components/OASHeatMap";
import { collectPatrolNames } from "@/pages/OasProgression/services/filterHeatMapSections";
import { groupRowsForHeatMap } from "@/pages/OasProgression/services/groupRowsForHeatMap";
import { loadOASProgressionFilters, saveOASProgressionFilters, type OASProgressionFilterState } from "@/pages/OasProgression/services/OASProgressionFilterPersistence";
import { OASDevTools } from "@/pages/OasProgression/components/OASDevTools";
import type { TerrainUnitMember } from "@/types/terrainTypes";

/** Developer-only panel for tuning heat map colors. Flip to true locally to use it; leave false when committing. */
const OAS_DEV_TOOLS_ENABLED = true;

interface OasProgressionTableProps {
  items: OASProgressionRow[];
  trunkStageCounts: Record<string, number>;
  members: TerrainUnitMember[];
  loadingStreams: Set<string>;
  onReloadAll: () => void;
  onReloadStream: (stream: string) => void;
}

const OAS_STREAMS = ["bushcraft", "bushwalking", "camping", "aquatics", "boating", "paddling", "alpine", "cycling", "vertical"];
const OAS_STREAM_TITLES: Record<string, string> = {
  bushcraft: "Bushcraft",
  bushwalking: "Bushwalking",
  camping: "Camping",
  aquatics: "Aquatics",
  boating: "Boating",
  paddling: "Paddling",
  alpine: "Alpine",
  cycling: "Cycling",
  vertical: "Vertical",
};
const MAX_STAGE = 9;
const STAGE_OPTIONS = Array.from({ length: MAX_STAGE }, (_, i) => i + 1);

const DEFAULT_FILTERS: OASProgressionFilterState = {
  viewMode: "heatmap",
  memberFilter: "",
  hideLastName: false,
  useCodenames: false,
  selectedPatrols: [],
  breakByPatrol: false,
  hideEmptyStreams: false,
  hideEmptyTopColumns: false,
  onlyInProgress: false,
  visibleStreams: OAS_STREAMS,
  stageRange: [1, MAX_STAGE],
  sortBy: "firstName",
};

const SORT_OPTIONS: Array<{ value: OASProgressionFilterState["sortBy"]; label: string }> = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "stageProgress", label: "Progression" },
];

function loadInitialFilters(): OASProgressionFilterState {
  const stored = loadOASProgressionFilters();
  if (!stored) {
    return DEFAULT_FILTERS;
  }
  return { ...DEFAULT_FILTERS, ...stored };
}

const columns: DataGridColumn<OASProgressionRow>[] = [
  { id: "memberName", header: "Member", accessorKey: "memberName", enableSorting: true },
  { id: "stream", header: "Skill", accessorKey: "stream", enableSorting: true },
  { id: "branch", header: "Stream", accessorKey: "branch", enableSorting: true },
  { id: "stage", header: "Stage", accessorKey: "stage", enableSorting: true },
  { id: "inputGroup", header: "Group", accessorKey: "inputGroup", enableSorting: true },
  { id: "iStatement", header: "I-Statement", accessorKey: "iStatement", enableSorting: true },
  { id: "answered", header: "Answered", accessorFn: (row) => (row.answered ? "Yes" : "No"), enableSorting: true },
  { id: "awarded", header: "Awarded", accessorFn: (row) => (row.awarded ? "Yes" : "No"), enableSorting: true },
  { id: "date", header: "Date", accessorKey: "date", enableSorting: true },
];

interface DropdownMultiSelectProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onToggle: (value: string) => void;
  dataAttr: string;
}

function DropdownMultiSelect({ label, options, selected, onToggle, dataAttr }: DropdownMultiSelectProps): React.ReactNode {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const summary = selected.length === options.length ? `All ${label.toLowerCase()} (${options.length})` : `${selected.length} selected`;

  return (
    <div className="oas-field" data-oas-dropdown={dataAttr} ref={containerRef}>
      <label className="oas-heatmap-filter-label">{label}</label>
      <div className="oas-dropdown-multiselect">
        <button type="button" className="summit-form-input oas-dropdown-multiselect-button" data-oas-dropdown-toggle={dataAttr} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          {summary}
        </button>
        {open && (
          <div className="oas-dropdown-multiselect-list" data-oas-dropdown-list={dataAttr}>
            {options.map((option) => (
              <label key={option.value} className="oas-heatmap-checkbox-label">
                <input type="checkbox" data-oas-dropdown-option={`${dataAttr}:${option.value}`} checked={selected.includes(option.value)} onChange={() => onToggle(option.value)} /> {option.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function OasProgressionTable(props: OasProgressionTableProps): React.ReactNode {
  const { items, trunkStageCounts, members, loadingStreams, onReloadAll } = props;
  const [filters, setFilters] = useState<OASProgressionFilterState>(loadInitialFilters);
  const heatMapExportRef = useRef<HTMLTableElement | null>(null);
  const [heatMapExportFeedback, setHeatMapExportFeedback] = useState("");

  const handleHeatMapPdfExport = async () => {
    if (!heatMapExportRef.current) {
      return;
    }

    try {
      await exportElementToPdf({
        element: heatMapExportRef.current,
        fileName: "OASProgressionHeatMap.pdf",
        title: "Terrain | Summit - OAS Progression Heat Map",
        orientation: "landscape",
      });
      setHeatMapExportFeedback("PDF export complete");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setHeatMapExportFeedback(`PDF export failed: ${message}`);
    }
  };

  useEffect(() => {
    saveOASProgressionFilters(filters);
  }, [filters]);

  const patch = (partial: Partial<OASProgressionFilterState>) => setFilters((prev) => ({ ...prev, ...partial }));

  const grouped = useMemo(() => groupRowsForHeatMap(items, trunkStageCounts, members), [items, trunkStageCounts, members]);
  const availablePatrols = useMemo(() => collectPatrolNames(Object.values(grouped).flatMap((skill) => skill.sections)), [grouped]);
  const hasAnyEmptySections = useMemo(() => Object.values(grouped).some((skill) => skill.sections.some((section) => section.isEmpty)), [grouped]);

  const toggleStream = (stream: string) => {
    const next = filters.visibleStreams.includes(stream) ? filters.visibleStreams.filter((s) => s !== stream) : [...filters.visibleStreams, stream];
    patch({ visibleStreams: next });
  };

  // selectedPatrols===[] means "no filter / show all" (see filterMembersByPatrol), so the dropdown
  // is shown as fully checked in that state — toggling off one checkbox must expand from the full
  // list, not from the empty array, or unchecking the first patrol would wrongly clear the filter.
  const togglePatrol = (patrol: string) => {
    const currentlySelected = filters.selectedPatrols.length === 0 ? availablePatrols : filters.selectedPatrols;
    const next = currentlySelected.includes(patrol) ? currentlySelected.filter((p) => p !== patrol) : [...currentlySelected, patrol];
    patch({ selectedPatrols: next });
  };

  const resetFilters = () => patch({ ...DEFAULT_FILTERS, viewMode: filters.viewMode });

  return (
    <div className="oas-progression-panel">
      <div className="oas-progression-view-row">
        <span className="oas-heatmap-filter-label">View</span>
        <button
          type="button"
          className="oas-slide-toggle"
          role="switch"
          aria-checked={filters.viewMode === "table"}
          aria-label="View mode"
          data-oas-slide-value={filters.viewMode}
          onClick={() => patch({ viewMode: filters.viewMode === "heatmap" ? "table" : "heatmap" })}
        >
          <span className="oas-slide-toggle-option" data-action="view-heatmap" aria-pressed={filters.viewMode === "heatmap"}>
            Heat map
          </span>
          <span className="oas-slide-toggle-option" data-action="view-table" aria-pressed={filters.viewMode === "table"}>
            Table
          </span>
        </button>

        <button type="button" className="oas-icon-button" data-action="reload-all" title="Refresh data" onClick={onReloadAll}>
          ↻
        </button>
      </div>

      {loadingStreams.size > 0 && (
        <div data-oas-progression-loading="true" role="status">
          Loading: {Array.from(loadingStreams).join(", ")}
        </div>
      )}

      {filters.viewMode === "heatmap" ? (
        <>
          <div className="oas-heatmap-controls">
            <div className="oas-field">
              <label className="oas-heatmap-filter-label" htmlFor="oas-heatmap-filter-member">
                Member
              </label>
              <div className="oas-search-input-wrapper">
                <span className="oas-search-icon" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="11.2" y1="11.2" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="oas-heatmap-filter-member"
                  className="summit-form-input oas-search-input"
                  type="text"
                  data-oas-filter="member"
                  placeholder="Name"
                  value={filters.memberFilter}
                  onChange={(e) => patch({ memberFilter: e.target.value })}
                />
              </div>
            </div>

            <DropdownMultiSelect label="Skills" options={OAS_STREAMS.map((stream) => ({ value: stream, label: OAS_STREAM_TITLES[stream] }))} selected={filters.visibleStreams} onToggle={toggleStream} dataAttr="skills" />

            {availablePatrols.length > 0 && (
              <DropdownMultiSelect
                label="Patrol"
                options={availablePatrols.map((patrol) => ({ value: patrol, label: patrol }))}
                selected={filters.selectedPatrols.length === 0 ? availablePatrols : filters.selectedPatrols}
                onToggle={togglePatrol}
                dataAttr="patrol"
              />
            )}

            <div className="oas-field" data-oas-stage-range="true">
              <label className="oas-heatmap-filter-label" htmlFor="oas-heatmap-stage-min">
                Stage
              </label>
              <div className="oas-stage-range-controls">
                <select
                  id="oas-heatmap-stage-min"
                  className="summit-form-input"
                  data-oas-stage="min"
                  value={filters.stageRange[0]}
                  onChange={(e) => patch({ stageRange: [Math.min(Number(e.target.value), filters.stageRange[1]), filters.stageRange[1]] })}
                >
                  {STAGE_OPTIONS.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                <span>to</span>
                <select
                  id="oas-heatmap-stage-max"
                  className="summit-form-input"
                  data-oas-stage="max"
                  value={filters.stageRange[1]}
                  onChange={(e) => patch({ stageRange: [filters.stageRange[0], Math.max(Number(e.target.value), filters.stageRange[0])] })}
                >
                  {STAGE_OPTIONS.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="oas-field">
              <label className="oas-heatmap-filter-label" htmlFor="oas-heatmap-sort-by">
                Sort by
              </label>
              <select id="oas-heatmap-sort-by" className="summit-form-input" data-oas-sort-select="true" value={filters.sortBy} onChange={(e) => patch({ sortBy: e.target.value as OASProgressionFilterState["sortBy"] })}>
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="oas-field oas-heatmap-display-group" data-oas-display-group="true">
              <legend className="oas-heatmap-filter-label">Display</legend>
              <label className="oas-heatmap-checkbox-label">
                <input id="oas-heatmap-use-codenames" type="checkbox" data-oas-toggle="use-codenames" checked={filters.useCodenames} onChange={(e) => patch({ useCodenames: e.target.checked })} /> Use codenames
              </label>
              <label className="oas-heatmap-checkbox-label">
                <input id="oas-heatmap-hide-last-name" type="checkbox" data-oas-toggle="hide-last-name" checked={filters.hideLastName} disabled={filters.useCodenames} onChange={(e) => patch({ hideLastName: e.target.checked })} /> Hide last
                name
              </label>
              {availablePatrols.length > 0 && (
                <label className="oas-heatmap-checkbox-label">
                  <input id="oas-heatmap-break-by-patrol" type="checkbox" data-oas-toggle="break-by-patrol" checked={filters.breakByPatrol} onChange={(e) => patch({ breakByPatrol: e.target.checked })} /> Break by patrol
                </label>
              )}
              {hasAnyEmptySections && (
                <label className="oas-heatmap-checkbox-label">
                  <input id="oas-heatmap-hide-empty-streams" type="checkbox" data-oas-toggle="hide-empty-streams" checked={filters.hideEmptyStreams} onChange={(e) => patch({ hideEmptyStreams: e.target.checked })} /> Hide empty streams
                </label>
              )}
              <label className="oas-heatmap-checkbox-label">
                <input id="oas-heatmap-hide-empty-top-columns" type="checkbox" data-oas-toggle="hide-empty-top-columns" checked={filters.hideEmptyTopColumns} onChange={(e) => patch({ hideEmptyTopColumns: e.target.checked })} /> Hide empty
                top columns
              </label>
              <label className="oas-heatmap-checkbox-label">
                <input id="oas-heatmap-only-in-progress" type="checkbox" data-oas-toggle="only-in-progress" checked={filters.onlyInProgress} onChange={(e) => patch({ onlyInProgress: e.target.checked })} /> Only show in-progress
              </label>
            </fieldset>

            <button type="button" className="summit-button summit-button-secondary oas-reset-button" data-action="reset-filters" onClick={resetFilters}>
              Reset filters
            </button>

            <button type="button" data-action="pdf-export" className="summit-button summit-button-secondary" onClick={handleHeatMapPdfExport}>
              PDF Export
            </button>
          </div>

          {heatMapExportFeedback && (
            <div data-heatmap-export-feedback="true" role="status" className="data-grid-export-feedback">
              {heatMapExportFeedback}
            </div>
          )}

          <OASHeatMap
            items={items}
            trunkStageCounts={trunkStageCounts}
            members={members}
            showEmptySections={!filters.hideEmptyStreams}
            memberFilter={filters.memberFilter}
            hideLastName={filters.hideLastName}
            useCodenames={filters.useCodenames}
            selectedPatrols={filters.selectedPatrols}
            breakByPatrol={filters.breakByPatrol}
            hideEmptyTopColumns={filters.hideEmptyTopColumns}
            onlyInProgress={filters.onlyInProgress}
            visibleStreams={filters.visibleStreams}
            stageRange={filters.stageRange}
            sortBy={filters.sortBy}
            exportRef={heatMapExportRef}
          />

          {OAS_DEV_TOOLS_ENABLED && <OASDevTools />}
        </>
      ) : (
        <DataGrid
          id="OasProgressionGrid"
          data={items}
          columns={columns}
          toolbarActions={["pdf", "excel"]}
          pageSizeOptions={[25, 50, 100]}
          exportOptions={{
            fileNamePrefix: "OASProgression",
            title: "Terrain | Summit - OAS Progression",
            orientation: "landscape",
          }}
        />
      )}
    </div>
  );
}
