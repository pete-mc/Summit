import { SummitDownloadLogbookMessage, SummitUploadLogbookMessage } from "../../typings/summitTypes";
import { SummitContext } from "../summitContext";
import { getLogbookData, saveLogbookData } from "../terrainCalls";
import $ from 'jquery';

// Initialization for writing logbook
export function initLogbookWrite() {
  const btn = ($(document).xpath(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`))[0] as unknown as HTMLButtonElement;
  const pasteBtn = $("<button>")
      .addClass("mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn")
      .attr("id", "writeClipboardBtn")
      .attr("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "writeLogbook", upload: false});lbChannel.close();')
      .text("Paste from Clipboard")
      .appendTo($(btn).parent().parent());
}

// Initialization for reading logbook
export function initLogbookRead() {
  const btn = $(document).xpath(`//button[ancestor::section[contains(@class, \'ViewRecord__no-print\')] and contains(@data-cy, \'PRINT\')]`)[0] as unknown as HTMLButtonElement;
  
  $(btn).addClass("mr-4");

  const clipBtn = $("<button>")
      .addClass("mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn")
      .attr("id", "copyClipboardBtn")
      .attr("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "loadLogbookData", record: window.$nuxt.$store._vm["logbook/getRecordId"], download: false});lbChannel.close();')
      .text("Copy to Clipboard")
      .appendTo($(btn).parent());

  const exportBtn = $("<button>")
      .addClass("mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn")
      .attr("id", "copyExportBtn")
      .attr("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "loadLogbookData", record: window.$nuxt.$store._vm["logbook/getRecordId"], download: true});lbChannel.close();')
      .text("Export")
      .appendTo($(btn).parent());
}
export async function loadLogbookData(messageData: SummitDownloadLogbookMessage , context: SummitContext){
  console.debug("Recieved loadLogbook message from Channel");
  const data = await getLogbookData(context, messageData.record)
  delete data.id;
  if (messageData.download){
      var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
      var downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href",     dataStr);
      downloadAnchorNode.setAttribute("download", data.title + "-logbook.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
  }
  else{
    navigator.clipboard.writeText(JSON.stringify(data));
    alert("Event copied");
    }
}

export async function writeLogbook(message: SummitUploadLogbookMessage, context: SummitContext){
  console.debug("Recieved writeLogbook message on channel: " + JSON.stringify(message));
  if(message.upload){
    uploadLogbookFile();
  }
  else{
    let clipboard = await navigator.clipboard.readText();
    if (!clipboard.startsWith("{") || !JSON.parse(clipboard).achievement_meta) { 
      alert("Please copy a log entry from the view page first.");
      return;
    }
    saveLogbookData(clipboard, context).then(() => location.reload());
  }
  function pickLogbookFile(onFilePicked: { (file: any): void; (arg0: File): void; }) {
    const inputElemenet = document.createElement('input');
    inputElemenet.style.display = 'none';
    inputElemenet.type = 'file';

    inputElemenet.addEventListener('change', () => {
        if (inputElemenet.files) {
            onFilePicked(inputElemenet.files[0]);
        }
    });

    const teardown = () => {
        document.body.removeEventListener('focus', teardown, true);
        setTimeout(() => {
            document.body.removeChild(inputElemenet);
        }, 1000);
    }
    document.body.addEventListener('focus', teardown, true);

    document.body.appendChild(inputElemenet);
    inputElemenet.click();
  }

  function uploadLogbookFile(){
    pickLogbookFile((file) => {
      var reader = new FileReader();
      reader.onload  = function(evt) {
          // file is loaded check it is valid and result is string
          if (!evt.target || evt.target.readyState !== 2 || typeof evt.target.result !== 'string') {
              return;
          }
          saveLogbookData(evt.target.result, context).then(() => location.reload());
      };
      reader.readAsText(file);
    })
  }
}