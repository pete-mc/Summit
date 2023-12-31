/* eslint-disable @typescript-eslint/no-explicit-any */
import $ from "jquery";
(window as any).$ = $;
(window as any).jQuery = $;
import "../styles/summit.css";
import "../styles/dependencies/editor.semanticui.min.css";
import { SummitContext } from "./summitContext";
import { SummitPageManager } from "./summitPages";
import { initCache } from "./helpers";
import { TerrainSummitContext, loadTerrainContext } from "./summitTerrainContext";
import "datatables.net-se";
import "datatables.net-buttons-se";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";
import "datatables.net-fixedheader-se";
import "datatables.net-responsive-se";
import "datatables.net-rowgroup-se";
import "datatables.net-select-se";

if (SummitContext.getInstance().buildMode === "dev") {
  SummitContext.getInstance().log("Dev Mode");
  console.log(SummitContext.getInstance());
}
async function initSummit() {
  $("head").append(`
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/fomantic-ui@2.9.3/dist/semantic.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/datatables.net-se/css/dataTables.semanticui.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/datatables.net-fixedheader-se/css/fixedHeader.semanticui.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/datatables.net-responsive-se/css/responsive.semanticui.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/datatables.net-select-se/css/select.semanticui.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/datatables.net-buttons-se/css/buttons.semanticui.min.css">
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  <script src="https://cdn.jsdelivr.net/npm/fomantic-ui@2.9.3/dist/semantic.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/jszip/dist/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pdfmake/build/pdfmake.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/pdfmake/build/vfs_fonts.js"></script>
`);
  loadTerrainContext();
  TerrainSummitContext.getInstance();
  const context = SummitContext.getInstance();
  context.log("Start");
  SummitPageManager.getInstance();
  initCache();
}

initSummit();
