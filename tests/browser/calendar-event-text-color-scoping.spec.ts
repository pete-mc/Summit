import { expect, test, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

const rgb = (value: string) => value.replace(/\s+/g, "").toLowerCase();
const computedColor = async (page: Page, selector: string) => rgb(await page.locator(selector).evaluate((el) => window.getComputedStyle(el).color));

test.describe("calendar scheduler scoped event text color", () => {
  test("keeps event text contrast fallback scoped to #scheduler across views and interactive states", async ({ page }) => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");

    await page.setContent(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <style>
            ${css}
            body { margin: 0; font-family: Arial, sans-serif; }
            .fc-event { display: inline-block; padding: 4px 8px; margin: 8px; text-decoration: none; }

            /* Host page styles that should NOT leak into scheduler event text nodes. */
            .fc .fc-event-time,
            .fc .fc-event-title,
            .fc .fc-list-event-time,
            .fc .fc-list-event-title a {
              color: rgb(12, 92, 210) !important;
            }

            .fc .fc-event:hover .fc-event-time,
            .fc .fc-event:hover .fc-event-title,
            .fc .fc-event.fc-event-selected .fc-event-time,
            .fc .fc-event.fc-event-selected .fc-event-title,
            .fc .fc-list-event.fc-event-selected .fc-list-event-time,
            .fc .fc-list-event.fc-event-selected .fc-list-event-title a {
              color: rgb(153, 0, 102) !important;
            }
          </style>
        </head>
        <body>
          <div id="scheduler">
            <div class="fc">
              <a class="fc-event fc-daygrid-event" style="background-color: #004c00; border-color: #004c00; color: #ffffff;" href="#">
                <div class="fc-event-main">
                  <span class="fc-event-time">7:00 PM</span>
                  <span class="fc-event-title">Day grid dark event</span>
                </div>
              </a>

              <a class="fc-event fc-timegrid-event fc-event-selected" style="background-color: #ffc82e; border-color: #ffc82e; color: #000000;" href="#">
                <div class="fc-event-main-frame">
                  <span class="fc-event-time">8:00 PM</span>
                  <span class="fc-event-title">Time grid light event</span>
                </div>
              </a>

              <table>
                <tbody>
                  <tr class="fc-list-event fc-event-selected" style="color: #ffffff; background-color: #004c00;">
                    <td class="fc-list-event-time">9:00 PM</td>
                    <td class="fc-list-event-title"><a href="#">List dark event</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div id="outside-scheduler">
            <div class="fc">
              <a class="fc-event fc-daygrid-event" style="background-color: #004c00; border-color: #004c00; color: #ffffff;" href="#">
                <div class="fc-event-main">
                  <span class="fc-event-time">Outside 7:00 PM</span>
                  <span class="fc-event-title">Outside day grid event</span>
                </div>
              </a>
            </div>
          </div>

          <div id="outside-scheduler-list">
            <div class="fc">
              <table>
                <tbody>
                  <tr class="fc-list-event fc-event-selected" style="color: #ffffff; background-color: #004c00;">
                    <td class="fc-list-event-time">Outside 9:00 PM</td>
                    <td class="fc-list-event-title"><a href="#">Outside list dark event</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);

    await page.hover("#scheduler .fc-daygrid-event");

    expect(await computedColor(page, "#scheduler .fc-daygrid-event .fc-event-time")).toBe("rgb(255,255,255)");
    expect(await computedColor(page, "#scheduler .fc-daygrid-event .fc-event-title")).toBe("rgb(255,255,255)");

    expect(await computedColor(page, "#scheduler .fc-timegrid-event .fc-event-time")).toBe("rgb(0,0,0)");
    expect(await computedColor(page, "#scheduler .fc-timegrid-event .fc-event-title")).toBe("rgb(0,0,0)");

    expect(await computedColor(page, "#scheduler .fc-list-event .fc-list-event-time")).toBe("rgb(255,255,255)");
    expect(await computedColor(page, "#scheduler .fc-list-event .fc-list-event-title a")).toBe("rgb(255,255,255)");

    expect(await computedColor(page, "#outside-scheduler .fc-daygrid-event .fc-event-time")).toBe("rgb(12,92,210)");
    expect(await computedColor(page, "#outside-scheduler .fc-daygrid-event .fc-event-title")).toBe("rgb(12,92,210)");
    expect(await computedColor(page, "#outside-scheduler-list .fc-list-event .fc-list-event-time")).toBe("rgb(153,0,102)");
    expect(await computedColor(page, "#outside-scheduler-list .fc-list-event .fc-list-event-title a")).toBe("rgb(153,0,102)");
  });
});
