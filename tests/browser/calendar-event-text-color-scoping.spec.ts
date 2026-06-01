import { expect, test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "../..");
const STYLES_PATH = path.resolve(REPO_ROOT, "src/styles/index.css");

const rgb = (value: string) => value.replace(/\s+/g, "").toLowerCase();

test.describe("calendar scheduler scoped event text color", () => {
  test("applies contrast text colors inside #scheduler only", async ({ page }) => {
    const css = fs.readFileSync(STYLES_PATH, "utf8");

    await page.setContent(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <style>
            ${css}
            body { margin: 0; font-family: Arial, sans-serif; }
            .fc-event { display: inline-block; padding: 4px 8px; margin: 8px; }
          </style>
        </head>
        <body>
          <div id="scheduler">
            <div class="fc">
              <a class="fc-event fc-daygrid-event" style="background-color: #004c00; border-color: #004c00;">
                <div class="fc-event-main">
                  <span class="fc-event-time">7:00 PM</span>
                  <span class="fc-event-title">Dark section event</span>
                </div>
              </a>
              <a class="fc-event fc-daygrid-event" style="background-color: #ffc82e; border-color: #ffc82e;">
                <div class="fc-event-main">
                  <span class="fc-event-time">8:00 PM</span>
                  <span class="fc-event-title">Light section event</span>
                </div>
              </a>
            </div>
          </div>

          <div id="outside-scheduler">
            <div class="fc">
              <a class="fc-event fc-daygrid-event" style="background-color: #004c00; border-color: #004c00;">
                <div class="fc-event-main">
                  <span class="fc-event-time" style="color: #ab3412;">Outside 7:00 PM</span>
                  <span class="fc-event-title" style="color: #1234ab;">Outside dark event</span>
                </div>
              </a>
            </div>
          </div>
        </body>
      </html>
    `);

    const insideDarkTitleColor = rgb(await page.locator("#scheduler .fc-event").nth(0).locator(".fc-event-title").evaluate((el) => window.getComputedStyle(el).color));
    const insideLightTitleColor = rgb(await page.locator("#scheduler .fc-event").nth(1).locator(".fc-event-title").evaluate((el) => window.getComputedStyle(el).color));
    const outsideDarkTitleColor = rgb(await page.locator("#outside-scheduler .fc-event .fc-event-title").evaluate((el) => window.getComputedStyle(el).color));
    const outsideDarkTimeColor = rgb(await page.locator("#outside-scheduler .fc-event .fc-event-time").evaluate((el) => window.getComputedStyle(el).color));

    expect(insideDarkTitleColor).toBe("rgb(255,255,255)");
    expect(insideLightTitleColor).toBe("rgb(0,0,0)");
    expect(outsideDarkTitleColor).toBe("rgb(18,52,171)");
    expect(outsideDarkTimeColor).toBe("rgb(171,52,18)");
  });
});