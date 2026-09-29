# Issues to investigate

> Important These are notes for the developer only. They should not be considered by an AI Agent until explicitly resolved by the developer.

## GUI

- Needs border left and right = 0
  .oas-heatmap-skill-title-row td

## Table Layout

- On the OAS Progression and Present Award pages the table layout, particularly the padding/margins need fixing. eg The member names are up against the far left edge of the table. But if I visit the Summit home page first then they appear correct. A hard refresh causes the error to reappear.

## Present Award

- Coonsider adding checksum in calendar to avoid "if two Leaders have the Present Awards page open at the same time, whichever one saves last wins and silently discards the other's changes — there's no merge, just a full replace." If you try and save with wrong version it would reload and merge remote and local changes, with warning.

- Move badge to before Award column.

Notes from Terrain help:
Scouts | Terrain supports you along the way of achieving a badge or element of the Achievement Pathways, but it does not keep track of whether an individual has been handed or ‘awarded’ their badge or achievement.

Submissions or changes that are made in the system all have dates & individuals associated with each change, to aid in reporting & auditing.

To see a list of what’s been submitted and approved, click the ‘Approvals’ button on the navigation bar. Only members of the Unit Council can see this page.

The first tab has all program items that have been submitted to the Unit Council for approval, and some actions you can take from this list.

The second tab has a historical view of all items that have been approved or rejected by the Unit Council.

The system can’t record that a youth member has had the achievement awarded to them, just that it’s been approved.

## OAS Progression

## I - Statements

- Filter area doesn't have same space below it, as per OAS Progession, Present Awards etc. This layout should be standard for every page we make.
