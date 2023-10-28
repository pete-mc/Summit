async function exportiCal() {
  const activityIdElement = document.querySelector('p.ActivityPlan__activity-id');
  if (!activityIdElement) {
      console.error("Activity ID element not found.");
      return;
  }
  const activityId = activityIdElement.innerText.split(': ')[1];

  const response = await fetch("https://events.terrain.scouts.com.au/events/"+ activityId, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem("CognitoIdentityServiceProvider.6v98tbc09aqfvh52fml3usas3c."+LastAuthUser+".idToken")
    },
    redirect: 'error', referrerPolicy: 'strict-origin-when-cross-origin', 
  });

  if (!response.ok) {
      console.error("Failed to fetch event data.");
      return;
  }

  const eventData = await response.json();

  const startDateTime = new Date(eventData.start_datetime);
  const endDateTime = new Date(eventData.end_datetime);

  const icsMSG = 
`BEGIN:VCALENDAR
BEGIN:VEVENT
URL:
DTSTART:${startDateTime.toISOString().replace(/[.:-]/g,"").substring(0,15) + "Z"}
DTEND:${endDateTime.toISOString().replace(/[.:-]/g,"").substring(0,15) + "Z"}
SUMMARY:${eventData.title}
DESCRIPTION:
LOCATION:${eventData.location}
END:VEVENT
END:VCALENDAR`;

  console.log(icsMSG);
  
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/calendar;charset=utf8,' + escape(icsMSG));
  element.setAttribute('download', eventData.title + ".ics");
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function initProgrammingExportBtn() {
  const btn = document.evaluate(`//button[@data-cy='PRINT']`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  const newButton = document.createElement("button");
  //css(newButton, styles.generateBtn);
  newButton.classList = "mb-2 mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small summit-btn";
  newButton.onclick = exportiCal;
  newButton.innerHTML = "Save to Calendar (iCal)";
  newButton.id = "exportiCalBtn";
  //Add the generate button to the page
  btn.parentElement.appendChild(newButton);
  document.evaluate(`//button[contains(@data-cy, 'PRINT')]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.classList.add("mr-4");
}