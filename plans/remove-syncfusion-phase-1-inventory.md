# Remove Syncfusion - Phase 1 Inventory and Baseline Contracts

This artifact captures the pre-migration Syncfusion usage inventory and explicit replacement targets.

## Key Syncfusion Usage Map

| Current Syncfusion usage | Current locations | Replacement target (Phase 2+) |
| --- | --- | --- |
| `@syncfusion/ej2-react-grids` + export toolbar interactions | `src/pages/PresentAwards/components/PresentAwards.tsx`, `src/pages/MilestoneReport/components/MilestoneReport.tsx`, `src/pages/OasReport/components/OasReport.tsx`, `src/pages/PeakAward/components/PeakAward.tsx`, `src/pages/SectionSummary/components/UnitSummary.tsx` | TanStack Table + OSS export adapters (SheetJS for Excel, jsPDF for PDF) |
| `@syncfusion/ej2-react-schedule` (`ScheduleComponent`) | `src/pages/SummitCalendar/components/SummitCalendar.tsx` | FullCalendar Community Edition |
| `@syncfusion/ej2-react-dropdowns` (`DropDownListComponent`, `DropDownTreeComponent`) | `src/pages/SummitCalendar/components/SummitCalendar.tsx` | `react-select` (single/multi) + OSS grouped/tree multi-select control |
| `@syncfusion/ej2-react-calendars` (`DatePickerComponent`, `TimePickerComponent`) | `src/pages/SummitCalendar/components/SummitCalendar.tsx`, `src/pages/PresentAwards/components/PresentAwards.tsx` | `react-datepicker` (date/time modes) |
| `@syncfusion/ej2-react-inputs` (`FormValidator`, `TextBoxComponent`) | `src/pages/SummitCalendar/components/SummitCalendar.tsx` | Native inputs + `react-hook-form` + `zod` validation |
| `@syncfusion/ej2-react-popups` (`DialogComponent`, `DialogUtility`) | `src/pages/SummitCalendar/components/SummitCalendar.tsx` | Radix UI Dialog + app-level confirm dialog wrapper |
| `@syncfusion/ej2-react-notifications` (`ToastComponent`) | `src/pages/PresentAwards/components/PresentAwards.tsx` | `react-hot-toast` |
| `@syncfusion/ej2-react-navigations` (`ClickEventArgs` for grid toolbar handlers) | All grid-backed report pages listed above | Local toolbar action types/events driven by replacement grid components |
| Syncfusion localization helper (`@syncfusion/ej2-base` `L10n`) | `src/pages/PresentAwards/components/PresentAwards.tsx` | Localized strings in app-owned constants/i18n utility |

## CI / Build Guard Baseline

Current Syncfusion license activation hooks that must remain intact until final removal phase:

- `package.json` script: `licence` -> `npx syncfusion-license activate`
- Workflow step in `.github/workflows/build.yaml`:
  - step name `Activate Syncfusion License`
  - command `npx syncfusion-license activate`
  - env `SYNCFUSION_LICENSE: ${{ secrets.SYNCFUSION_LICENSE }}`

## Phase 1 Acceptance Criteria (baseline only)

1. Import inventory detection test passes against an explicit contract artifact.
2. Baseline render-contract test confirms key Syncfusion-backed page markers still exist pre-migration.
3. CI license guard test confirms current license activation hooks are documented and enforced.
4. No Syncfusion components are replaced in this phase.
