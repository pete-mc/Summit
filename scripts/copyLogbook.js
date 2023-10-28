function initLogbookWrite() {
  const btn = document.evaluate(`//button[contains(@data-cy, 'ADD_NEW_RECORD')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const pasteBtn = document.createElement("button");
  //css(newButton, styles.generateBtn);
  pasteBtn.classList = "mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn";
  pasteBtn.setAttribute("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "writeLogbook", upload: false});lbChannel.close();');
  pasteBtn.id = "writeClipboardBtn";
  pasteBtn.innerHTML = "Paste from Clipboard";
  btn.parentElement.parentElement.appendChild(pasteBtn);

  const importBtn = document.createElement("button");
  //css(newButton, styles.generateBtn);
  importBtn.classList = "mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn";
  importBtn.setAttribute("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "writeLogbook", upload: true});lbChannel.close();');
  importBtn.id = "writeUploadBtn";
  importBtn.innerHTML = "Import";
  btn.parentElement.parentElement.appendChild(importBtn);

}

function initLogbookRead() {
    const btn = document.evaluate(`//button[ancestor::section[contains(@class, 'ViewRecord__no-print')] and contains(@data-cy, 'PRINT')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    btn.classList.add("mr-4");
    const clipBtn = document.createElement("button");
    //css(newButton, styles.generateBtn);
    clipBtn.classList = "mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn";
    clipBtn.setAttribute("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "loadLogbookData", record: window.$nuxt.$store._vm["logbook/getRecordId"], download: false});lbChannel.close();');
    
    clipBtn.innerHTML = "Copy to Clipboard";
    clipBtn.id = "copyClipboardBtn";
    //Add the generate button to the page
    btn.parentElement.appendChild(clipBtn);

    const exportBtn = document.createElement("button");
    //css(exportBtn, styles.generateBtn);
    exportBtn.classList = "mr-4 float-right v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn";
    exportBtn.setAttribute("onclick", 'lbChannel = new BroadcastChannel("TerrainSummit");lbChannel.postMessage({type: "loadLogbookData", record: window.$nuxt.$store._vm["logbook/getRecordId"], download: true});lbChannel.close();');
    exportBtn.innerHTML = "Export";
    exportBtn.id = "copyClipboardBtn";
    //Add the generate button to the page
    btn.parentElement.appendChild(exportBtn);
}

async function saveLogbookData(text){
  console.debug("Sending logbook to terrain");
  await fetch('https://achievements.terrain.scouts.com.au/members/' + currentProfile.profiles[0].member.id + '/logbook', {
    "headers": {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9",
      "authorization": localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken"),
      "content-type": "application/json;charset=UTF-8",
      "sec-ch-ua": "'Chromium';v='94', 'Microsoft Edge';v='94', ';Not A Brand';v='99'",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "Windows",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    "referrer": "https://terrain.scouts.com.au/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": text,
    "method": "POST",
    "mode": "cors"
  }).then(()=>{location.reload()});
}


async function loadLogbookData(message){
  console.debug("Recieved loadLogbook message from Channel");
  fetch("https://achievements.terrain.scouts.com.au/members/"+currentProfile.profiles[0].member.id+"/logbook/"+message.data.record, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin', 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken")
    },
    redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
  }).then(response => response.json())
  .then(data => {
    delete data.id;
    if (message.data.download){
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
  });
}

async function writeLogbook(message){
  console.debug("Recieved writeLogbook message on channel: " + JSON.stringify(message));
  if(message.data.upload){
    uploadLogbookFile();
  }
  else{
    let clipboard = await navigator.clipboard.readText();
    if (!clipboard.startsWith("{") || !JSON.parse(clipboard).achievement_meta) { 
      alert("Please copy a log entry from the view page first.");
      return;
    }
    saveLogbookData(clipboard);
  }
  function pickLogbookFile(onFilePicked) {
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
          // file is loaded
          saveLogbookData(evt.target.result);
          ready = true;
      };
      reader.readAsText(file);
    })
  }
}

//Add channel listeners

summitMessageHandlers.push({type: "loadLogbookData", handler: (e) => loadLogbookData(e)});
summitMessageHandlers.push({type: "writeLogbook", handler: (e) => writeLogbook(e)});