import { expect, test, type Locator, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

const dialogBodyStyle = ["flex: 1 1 0%", "min-height: 0", "overflow-y: auto", "overflow-x: hidden"].join(";");

const dialogFooterStyle = ["display: flex", "justify-content: flex-end", "gap: 8px", "margin-top: 8px", "position: sticky", "bottom: 0", "background: var(--summit-color-bg-surface)", "padding-top: 8px", "flex-shrink: 0"].join(";");

const editorField = (name: string, label: string, control: string, status = "") => `
  <div class="editor-field" data-editor-field="${name}">
    <label class="editor-field-label" for="${name}">${label} <span class="editor-field-required" aria-hidden="true">*</span></label>
    <div class="editor-field-control">${control}</div>
    <div class="editor-field-status" data-editor-validation="${name}" role="status">${status}</div>
  </div>
`;

const groupedSelect = (id: string, label: string) =>
  editorField(
    id,
    label,
    `<select id="${id}" name="${id}" multiple class="summit-form-input" size="4">
    <optgroup label="Patrol A"><option>Alex Example</option><option>Blair Example</option></optgroup>
    <optgroup label="Patrol B"><option>Casey Example</option><option>Drew Example</option></optgroup>
  </select>`,
  );

const setCalendarEditorContent = async (page: Page, viewport: { width: number; height: number }) => {
  await page.setViewportSize(viewport);
  const css = fs.readFileSync(STYLES_PATH, "utf8");

  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          ${css}
          html, body { margin: 0; min-height: 100%; }
          body { font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <div id="calendar-editor-dialog" role="dialog" aria-modal="true" style="position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center;">
          <div class="summit-dialog-surface">
            <div class="summit-dialog-header">
              <h3 class="summit-dialog-title">New Event</h3>
              <button type="button" class="summit-button summit-button-secondary" data-dialog-close="true">×</button>
            </div>
            <div data-dialog-body="calendar-editor" style="${dialogBodyStyle}">
              <div data-editor-speed-contract="calendar-editor-speed" data-editor-open-proxy="true" data-editor-loading-proxy="false" data-editor-shortcuts="enabled" tabindex="0">
                <div class="editor-container" data-editor-layout="compact">
                  ${editorField("title", "Title", '<input id="title" class="summit-form-input" type="text" name="title" value="Weekend Hike" data-msg-containerid="titleError" data-editor-default="title" />')}
                  ${editorField("location", "Location", '<input id="location" class="summit-form-input" type="text" name="location" value="Summit Trail" data-editor-default="location" />')}
                  ${editorField("challenge_area", "Challenge Area", '<select id="challenge_area" name="challenge_area" class="summit-form-input"><option>Outdoors</option></select>')}
                  <div class="editor-field" data-editor-field="date_range">
                    <div class="editor-field-control">
                      <div class="editor-date-time-grid">
                        <div class="editor-date-time-group" data-editor-date-time-group="start">
                          <label class="editor-date-time-label" for="start_date">Start <span class="editor-field-required" aria-hidden="true">*</span></label>
                          <div class="editor-date-time-inputs">
                            <input id="start_date" class="summit-form-input" type="text" name="start_date" value="04/05/26" />
                            <input id="start_time" class="summit-form-input" type="text" name="start_time" value="07:00 PM" />
                          </div>
                        </div>
                        <div class="editor-date-time-group" data-editor-date-time-group="end">
                          <label class="editor-date-time-label" for="end_date">End <span class="editor-field-required" aria-hidden="true">*</span></label>
                          <div class="editor-date-time-inputs">
                            <input id="end_date" class="summit-form-input" type="text" name="end_date" value="04/05/26" />
                            <input id="end_time" class="summit-form-input" type="text" name="end_time" value="09:00 PM" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="editor-field-status" data-editor-validation="date_range" role="status"></div>
                    <div class="editor-field-help" data-editor-warning="event-conflicts" role="status"></div>
                  </div>
                  ${groupedSelect("scout_method_elements", "Scout Method")}
                  ${groupedSelect("organisers", "Organisers")}
                  ${groupedSelect("leader_members", "Leads")}
                  ${groupedSelect("assistant_members", "Assists")}
                </div>
              </div>
            </div>
            <div style="${dialogFooterStyle}">
              <div id="event-footer" class="calendar-editor-footer">
                <div id="right-button" class="calendar-editor-actions">
                  <button id="SaveNext" class="summit-button summit-button-primary" data-editor-action="save-next-week">Save &amp; Add Next Week</button>
                  <button id="Save" class="summit-button summit-button-primary" data-editor-action="save">Save</button>
                  <button id="Cancel" class="summit-button summit-button-secondary" data-editor-action="cancel">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
};

const expectBoxInside = (box: { x: number; y: number; width: number; height: number }, container: { x: number; y: number; width: number; height: number }) => {
  expect(box.x).toBeGreaterThanOrEqual(container.x - 1);
  expect(box.x + box.width).toBeLessThanOrEqual(container.x + container.width + 1);
  expect(box.y).toBeGreaterThanOrEqual(container.y - 1);
  expect(box.y + box.height).toBeLessThanOrEqual(container.y + container.height + 1);
};

const expectBoxHorizontallyInside = (box: { x: number; width: number }, container: { x: number; width: number }) => {
  expect(box.x).toBeGreaterThanOrEqual(container.x - 1);
  expect(box.x + box.width).toBeLessThanOrEqual(container.x + container.width + 1);
};

const expectNoHorizontalBleed = async (page: Page) => {
  const bleedMetrics = await page.evaluate(() => {
    const dialogBody = document.querySelector<HTMLElement>("[data-dialog-body='calendar-editor']");
    const surface = document.querySelector<HTMLElement>(".summit-dialog-surface");
    return {
      documentScrollWidth: document.documentElement.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: dialogBody?.scrollWidth ?? 0,
      bodyClientWidth: dialogBody?.clientWidth ?? 0,
      surfaceRight: surface?.getBoundingClientRect().right ?? 0,
      viewportWidth: window.innerWidth,
    };
  });

  expect(bleedMetrics.documentScrollWidth).toBeLessThanOrEqual(bleedMetrics.documentClientWidth + 1);
  expect(bleedMetrics.bodyScrollWidth).toBeLessThanOrEqual(bleedMetrics.bodyClientWidth + 1);
  expect(bleedMetrics.surfaceRight).toBeLessThanOrEqual(bleedMetrics.viewportWidth + 1);
};

const boundingBox = async (locator: Locator) => {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
};

test.describe("calendar editor dialog browser layout", () => {
  test("wide viewport keeps borders and content inside the dialog with two-column date/time layout", async ({ page }) => {
    await setCalendarEditorContent(page, { width: 1200, height: 900 });

    const surface = await boundingBox(page.locator(".summit-dialog-surface"));
    expectBoxInside(surface, { x: 0, y: 0, width: 1200, height: 900 });

    await expect(page.locator("[data-editor-layout='compact']")).toBeVisible();
    await expect(page.locator("[data-editor-validation='date_range']")).toBeAttached();
    await expect(page.locator("[data-editor-warning='event-conflicts']")).toBeAttached();
    await expect(page.locator("[data-editor-action='save']")).toBeVisible();
    await expect(page.locator("[data-editor-action='cancel']")).toBeVisible();

    const visibleControls = page.locator(".summit-form-input:visible");
    for (let index = 0; index < (await visibleControls.count()); index += 1) {
      expectBoxHorizontallyInside(await boundingBox(visibleControls.nth(index)), surface);
    }

    const fieldGaps = await page.locator(".editor-field").evaluateAll((fields) =>
      fields.slice(1).map((field, index) => {
        const previous = fields[index].getBoundingClientRect();
        const current = field.getBoundingClientRect();
        return current.top - previous.bottom;
      }),
    );
    expect(fieldGaps.every((gap) => gap >= 8)).toBe(true);

    const startGroup = await boundingBox(page.locator("[data-editor-date-time-group='start']"));
    const endGroup = await boundingBox(page.locator("[data-editor-date-time-group='end']"));
    expect(Math.abs(startGroup.y - endGroup.y)).toBeLessThanOrEqual(1);
    expect(endGroup.x).toBeGreaterThan(startGroup.x + startGroup.width - 1);

    const startDate = await boundingBox(page.locator("#start_date"));
    const startTime = await boundingBox(page.locator("#start_time"));
    expect(Math.abs(startDate.y - startTime.y)).toBeLessThanOrEqual(1);
    expect(startTime.x).toBeGreaterThan(startDate.x + startDate.width - 1);

    const bodyBeforeScroll = await boundingBox(page.locator("[data-dialog-body='calendar-editor']"));
    await page.locator("[data-dialog-body='calendar-editor']").evaluate((body) => {
      body.scrollTop = body.scrollHeight;
    });
    const footerAfterScroll = await boundingBox(page.locator(".calendar-editor-footer"));
    expect(footerAfterScroll.y).toBeGreaterThanOrEqual(bodyBeforeScroll.y + bodyBeforeScroll.height - 24);
    expectBoxInside(footerAfterScroll, surface);

    await expectNoHorizontalBleed(page);
  });

  test("narrow viewport stacks date/time controls, keeps footer visible, and avoids horizontal bleed", async ({ page }) => {
    await setCalendarEditorContent(page, { width: 390, height: 800 });

    const surface = await boundingBox(page.locator(".summit-dialog-surface"));
    expectBoxInside(surface, { x: 0, y: 0, width: 390, height: 800 });

    const startGroup = await boundingBox(page.locator("[data-editor-date-time-group='start']"));
    const endGroup = await boundingBox(page.locator("[data-editor-date-time-group='end']"));
    expect(Math.abs(startGroup.x - endGroup.x)).toBeLessThanOrEqual(1);
    expect(endGroup.y).toBeGreaterThan(startGroup.y + startGroup.height - 1);

    const startDate = await boundingBox(page.locator("#start_date"));
    const startTime = await boundingBox(page.locator("#start_time"));
    expect(Math.abs(startDate.x - startTime.x)).toBeLessThanOrEqual(1);
    expect(startTime.y).toBeGreaterThan(startDate.y + startDate.height - 1);

    const actionButtons = page.locator(".calendar-editor-actions .summit-button:visible");
    for (let index = 0; index < (await actionButtons.count()); index += 1) {
      expectBoxInside(await boundingBox(actionButtons.nth(index)), surface);
    }

    const footerBeforeScroll = await boundingBox(page.locator(".calendar-editor-footer"));
    await page.locator("[data-dialog-body='calendar-editor']").evaluate((body) => {
      body.scrollTop = body.scrollHeight;
    });
    const footerAfterScroll = await boundingBox(page.locator(".calendar-editor-footer"));
    expect(Math.abs(footerBeforeScroll.y - footerAfterScroll.y)).toBeLessThanOrEqual(1);
    expectBoxInside(footerAfterScroll, surface);

    await expectNoHorizontalBleed(page);
  });
});
