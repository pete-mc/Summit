import { getLogbookData, saveLogbookData } from "@/services";

function setClasses(classid: string, classes: string) {
  const button = $("." + classid);
  button.removeClass().addClass(classid);
  //set all classes from target to button
  button.addClass(classes);
  button.addClass("summit-btn");
}

function observe(targetNode: Node, classid: string) {
  const config = { attributes: true, childList: false, subtree: false };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callback = function (mutationsList: any) {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes") {
        if (mutation.attributeName === "class") {
          setClasses(classid, $(targetNode).attr("class") ?? "");
        }
      }
    }
  };
  const observer = new MutationObserver(callback);
  if (targetNode) observer.observe(targetNode, config);
}

// Initialization for writing logbook
export function InitLogbookWrite() {
  const btn = $(document).xpath(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`)[0] as unknown as HTMLButtonElement;
  // add 5 padding to btn
  $(btn).attr("style", "margin: 5px;");
  $("<button>")
    .attr("id", "writeClipboardBtn")
    .addClass("writeClipboardBtn summit-btn")
    .on("click", () => {
      WriteLogbook(false);
    })
    .attr("data-v-bf1122da", "")
    .attr("style", "margin: 5px;")
    .html('<span class="v-btn__content">Paste from clipboard</span>')
    .appendTo($(btn).parent().parent());
  setClasses("writeClipboardBtn", $(btn).attr("class") ?? "");
  observe(btn, "writeClipboardBtn");
}

// Initialization for reading logbook
export function InitLogbookRead(): void {
  const btn = $(document).xpath(`//button[ancestor::section[contains(@class, \'ViewRecord__no-print\')] and contains(@data-cy, \'PRINT\')]`)[0] as unknown as HTMLButtonElement;
  $(btn).parent().attr("style", "display: flex;flex-wrap: wrap;align-items: center;justify-content: flex-end; gap: 10px;");
  $(btn).attr("style", "margin: 5px;");
  $("<button>")
    .attr("style", "margin: 5px;")
    .attr("id", "copyClipboardBtn")
    .attr("data-v-34905e32", "")
    .addClass("copyClipboardBtn summit-btn")
    .on("click", () => {
      LoadLogbookData(true);
    })
    .html('<span class="v-btn__content">Copy to Clipboard')
    .appendTo($(btn).parent());

  setClasses("copyClipboardBtn", $(btn).attr("class") ?? "");
  observe(btn, "copyClipboardBtn");

  $("<button>")
    .attr("style", "margin: 5px;")
    .attr("id", "copyExportBtn")
    .attr("data-v-34905e32", "")
    .addClass("copyExportBtn summit-btn")
    .on("click", () => {
      LoadLogbookData(true);
    })
    .html('<span class="v-btn__content">Export')
    .appendTo($(btn).parent());
  setClasses("copyExportBtn", $(btn).attr("class") ?? "");
  observe(btn, "copyExportBtn");
}
export async function LoadLogbookData(download?: boolean): Promise<void> {
  console.debug("Recieved loadLogbook message from Channel");
  const data = await getLogbookData(window.$nuxt.$store._vm["logbook/getRecordId"]);
  if (!data) {
    alert("Could not load logbook data");
    return;
  }
  delete data.id;
  if (download) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", data.title + "-logbook.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  } else {
    navigator.clipboard.writeText(JSON.stringify(data));
    alert("Event copied");
  }
}

export async function WriteLogbook(upload?: boolean): Promise<void> {
  if (upload) {
    uploadLogbookFile();
  } else {
    const clipboard = await navigator.clipboard.readText();
    if (!clipboard.startsWith("{") || !JSON.parse(clipboard).achievement_meta) {
      alert("Please copy a log entry from the view page first.");
      return;
    }
    saveLogbookData(clipboard).then(() => location.reload());
  }
  function pickLogbookFile(onFilePicked: { (file: never): void; (arg0: File): void }) {
    const inputElemenet = document.createElement("input");
    inputElemenet.style.display = "none";
    inputElemenet.type = "file";

    inputElemenet.addEventListener("change", () => {
      if (inputElemenet.files) {
        onFilePicked(inputElemenet.files[0]);
      }
    });

    const teardown = () => {
      document.body.removeEventListener("focus", teardown, true);
      setTimeout(() => {
        document.body.removeChild(inputElemenet);
      }, 1000);
    };
    document.body.addEventListener("focus", teardown, true);

    document.body.appendChild(inputElemenet);
    inputElemenet.click();
  }

  function uploadLogbookFile() {
    pickLogbookFile((file) => {
      const reader = new FileReader();
      reader.onload = function (evt) {
        // file is loaded check it is valid and result is string
        if (!evt.target || evt.target.readyState !== 2 || typeof evt.target.result !== "string") {
          return;
        }
        saveLogbookData(evt.target.result).then(() => location.reload());
      };
      reader.readAsText(file);
    });
  }
}
