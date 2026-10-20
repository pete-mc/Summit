# Changelog

## 2026-10-20 - Pathways update

Changes introduced in commit [7690642](https://github.com/pete-mc/Summit/commit/769064220f7cd8d47c5ca1c9a5983ad4ae04fc84) ([#165](https://github.com/pete-mc/Summit/pull/165)).

### Changed

- Updated milestone lead requirements to 2, 4, and 6 leads for Milestones 1, 2, and 3 respectively, using shared logic in Milestone Planning and Section Summary.
- Removed assist requirements from Milestone Planning calculations, including completion percentages, and removed assist columns from Milestone Planning, Peak Award, and Section Summary reports.
- Clarified report headings to distinguish total leads from participation counts in each challenge area, including Peak Award export headings.
- Updated Milestone Planning guidance to describe remaining participation and lead requirements.
- Removed the Assists selector and leader/assistant overlap validation from the Summit Calendar event editor. Event attendance payloads no longer include assistant member IDs.

### Tests

- Added coverage for revised milestone lead requirements, assist-independent completion calculations, and Section Summary remaining counts.
- Updated calendar editor layout, validation, and payload tests to reflect the removal of assists.
