/** Shaped like OASPeakAwardSummaryVue's real render (rowspan/colspan, scoped attrs, empty <col>s). Invented content. */
export function summaryTableHtml({ special = true } = {}): string {
  const specialHead1 = special ? '<th data-v-abc="" class="oas-heatmap-stage-group-header oas-peak-award-summary-th-top">Special</th>' : "";
  const specialHead2 = special ? '<th data-v-abc="" class="oas-heatmap-stage-group-header oas-peak-award-summary-th-bottom">4 above Stage 3</th>' : "";
  const specialCell = special
    ? '<td data-v-abc="" class="oas-heatmap-stage-cell"><div class="oas-peak-award-summary-row"><div class="oas-heatmap-squares"><div class="oas-heatmap-square oas-heatmap-square-answered" title="Tip"></div></div><span class="oas-peak-award-summary-text">1 of 4</span></div></td>'
    : "";
  const cols = Array.from({ length: special ? 8 : 7 }, () => "<col>").join("");
  const row = (id: string, name: string) => `
    <tr data-v-abc="" data-oas-member="${id}">
      <td data-v-abc="" class="oas-heatmap-member-name">${name}</td>
      <td data-v-abc="" class="oas-heatmap-highest-stage">3 of 10</td>
      <td data-v-abc="" class="oas-heatmap-highest-stage">30%</td>
      <td data-v-abc="" class="oas-heatmap-stage-cell"><div data-v-abc="" title="Bar tooltip" class="oas-heatmap-stage-bar oas-heatmap-stage-bar-complete oas-peak-award-summary-bar" style="width: 94px;"></div></td>
      <td data-v-abc="" class="oas-heatmap-stage-cell"><div class="oas-heatmap-squares"><div class="oas-heatmap-square oas-heatmap-square-unanswered" style="width: 18px; height: 18px;" title="Box"></div></div></td>
      <td data-v-abc="" class="oas-heatmap-stage-cell"><div class="oas-heatmap-squares"><div class="oas-heatmap-square oas-heatmap-square-answered" title="Box"></div></div></td>
      <td data-v-abc="" class="oas-heatmap-stage-cell"><div class="oas-peak-award-summary-row"><span class="oas-peak-award-summary-text">2 of 6</span></div></td>
      ${specialCell}
    </tr>`;
  return `
<div class="oas-heatmap-scroll">
  <div class="v-data-table oas-heatmap-data-table v-data-table--dense theme--light">
    <div class="v-data-table__wrapper">
      <table>
        <colgroup>${cols}</colgroup>
        <thead data-v-abc="" class="oas-peak-award-summary-thead">
          <tr>
            <th data-v-abc="" rowspan="2" class="oas-heatmap-member-header">Member</th>
            <th data-v-abc="" rowspan="2" colspan="2" class="oas-heatmap-stage-group-header">Progress</th>
            <th data-v-abc="" colspan="3" class="oas-peak-award-summary-core-skills-header">Core Skills</th>
            <th data-v-abc="" rowspan="2" class="oas-heatmap-stage-group-header">Progressions</th>
            ${specialHead1}
          </tr>
          <tr>
            <th data-v-abc="">Bushcraft</th><th data-v-abc="">Bushwalking</th><th data-v-abc="">Camping</th>
            ${specialHead2}
          </tr>
        </thead>
        <tbody data-v-abc="">${row("member-a", "Member A")}${row("member-b", "Member B")}</tbody>
      </table>
    </div>
  </div>
</div>`;
}

export function mountSummaryTable(options: { special?: boolean } = {}): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = summaryTableHtml(options);
  document.body.appendChild(host);
  return host;
}
