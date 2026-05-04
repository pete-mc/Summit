# SIA transfer contract (`summit-sia-v1`)

This document defines the Summit SIA export/import JSON contract used on Terrain `/sia`.

## Contract envelope

All transfer files MUST be JSON with this top-level shape:

- `contract` (string): must equal `summit-sia-v1`
- `project` (object): create-portable Special Interest Area payload

## Required `project` fields for import

Import validation requires:

- `project.type` = `special_interest_area`
- `project.section` (non-empty string)
- `project.answers` (object)
- `project.answers.project_name` (non-empty string)
- `project.answers.special_interest_area_selection` (non-empty string)

If any required fields are missing/invalid, import is rejected before API create.

## Portable fields preserved in export/import

Summit transfer only preserves these `project` keys:

- `section`
- `type`
- `template`
- `version`
- `answers`
- `achievement_meta`
- `event_log`
- `event_count`
- `imported`
- `expiry_date`

## Excluded fields

Export/import intentionally excludes volatile/system fields, including:

- IDs and ownership fields (`id`, `member_id`)
- status/timestamps (`status`, `status_updated`, `last_updated`)
- submission metadata (`latest_submission`)
- uploads (`uploads`)

## Import behavior constraints

- Import mode is **create-only** (no update/merge of existing SIA projects).
- Uploaded attachments are **not transferred**.
- A valid auth token is required to import.
- Malformed JSON is rejected with validation feedback.
