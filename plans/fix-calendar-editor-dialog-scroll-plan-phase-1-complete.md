# Phase 1 Complete: Add failing scroll behavior tests

Added failing contract tests that define expected dialog scrolling behavior and fixed-footer behavior before any production implementation. This locks in the bug reproduction and establishes clear pass criteria for the next phase.

**Files created/changed:**

- tests/unit/components/dialog-scrollable-content.spec.ts
- tests/unit/components/calendar-editor-integration.spec.ts
- plans/fix-calendar-editor-dialog-scroll-plan-phase-1-complete.md

**Functions created/changed:**

- `describe("DialogComponent scroll behavior contract")`
- `it("DialogComponent body is vertically scrollable for overflowing content")`
- `it("dialog footer actions remain rendered and independently accessible")`
- `describe("Phase 1 calendar editor integration contract")`
- `it("calendar-editor-dialog content remains reachable via vertical scroll")`

**Tests created/changed:**

- DialogComponent body is vertically scrollable for overflowing content
- dialog footer actions remain rendered and independently accessible
- calendar-editor-dialog content remains reachable via vertical scroll

**Review Status:** APPROVED

**Git Commit Message:**
test: add failing dialog scroll contracts

- add contract tests for scrollable dialog body behavior
- add contract test for fixed, independently accessible footer
- add calendar editor integration test for vertical scroll reachability
