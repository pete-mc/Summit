import $ from "jquery";
//import jszip from "jszip";
//import pdfmake from "pdfmake";
//import DataTable from "datatables.net-se";
import Editor from "@datatables.net/editor-se";
import "datatables.net-se";
import "datatables.net-buttons-se";
import "datatables.net-buttons/js/buttons.html5.mjs";
import "datatables.net-buttons/js/buttons.print.mjs";
//import DateTime from "datatables.net-datetime";
import "datatables.net-fixedheader-se";
import "datatables.net-responsive-se";
import "datatables.net-rowgroup-se";
import "datatables.net-select-se";
import moment from "moment";
import { SummitContext } from "../../summitContext";
import { createNewEvent, fetchUnitMembers } from "../../terrainCalls";
import flatpickr from "flatpickr";
import DataTable, { CellSelector } from "datatables.net-se";
import bulkCalendarHTML from "raw-loader!./bulkCalendar.html";

export const bulkCalendarHtml = bulkCalendarHTML;

export async function bulkCalendar(message?: string): Promise<void> {
  const context = SummitContext.getInstance();
  let lastId = 0; // Used to increment the ID for new records
  const challengeAreaOptions = [
    { label: "Community", value: "community" },
    { label: "Outdoor", value: "outdoor" },
    { label: "Creative", value: "creative" },
    { label: "Personal Growth", value: "personal_growth" },
  ];

  const scoutMethodOptions = [
    { label: "Symbolic Framework", value: "symbolic_framework" },
    { label: "Community Involvement", value: "community_involvement" },
    { label: "Learning by Doing", value: "learn_by_doing" },
    { label: "Nature and Outdoors", value: "nature_and_outdoors" },
    { label: "Patrol System", value: "patrol_system" },
    { label: "Youth Lead Adult Support", value: "youth_leading_adult_supporting" },
    { label: "Promise & Law", value: "promise_and_law" },
    { label: "Personal Progression", value: "personal_progression" },
  ];

  // Fetch members for Organisers, Leaders, and Assists columns
  $(".errorP").remove();
  $(".loadingP").remove();
  $("#submit").hide();
  $("#add").hide();
  const members = (await fetchUnitMembers())?.map((member) => ({ member_id: member.id, name: member.first_name + " " + member.last_name }));
  if (!members || !context.currentProfile) {
    $("#loadingP").text(
      "Error loading members. Please click the button to try again. This is a Summit error. Please do not contact Terrain support for this issue. If this error persists please add an issue to the Summit GitHub repository. ",
    );
    $("#loadingP").after('<button id="retry" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Retry</button>');
    // button to access github issues list
    $("#loadingP").after(
      '<a id="guthub" href="https://github.com/pete-mc/Summit/issues" target="_blank"><button class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Summit Issues Register</button></a>',
    );
    $("#retry").on("click", async function () {
      !context.currentProfile ? await context.getData() : undefined;
      bulkCalendar();
    });
    return;
  }
  $("#bulkHeader").text(context.currentProfile.unit.name + " Bulk Calendar Events");
  $("#loadingP").remove();
  $("#retry").remove();
  $("#guthub").remove();

  //remove loading text and show button
  $("#loadingP").remove();
  $("#submit").show();
  $("#add").show();

  if (message) $("#submit").after('<p class="loadingP" style="color:green;">' + message + "</p>");

  const memberOptions = members.map((member) => ({
    label: member.name,
    value: member.member_id,
  }));

  // editor settings below:
  const DTEditor = new Editor({
    table: "#eventTable",
    idSrc: "id",
    fields: [
      { label: "Title", name: "title" },
      { label: "Location", name: "location" },
      {
        label: "Challenge Area",
        name: "challenge_area",
        type: "select",
        options: challengeAreaOptions,
      },
      { label: "Start", name: "startDate", type: "text", attr: { readonly: "readonly" } },
      { label: "End", name: "endDate", type: "text", attr: { readonly: "readonly" } },
      {
        label: "Scout Method",
        name: "scout_method",
        type: "select",
        options: scoutMethodOptions,
        separator: ",",
        multiple: true,
      },
      { label: "Organisers", name: "organisers", type: "select", multiple: true, options: memberOptions, separator: "," },
      { label: "Leads", name: "leads", type: "select", multiple: true, options: memberOptions, separator: "," },
      { label: "Assists", name: "assists", type: "select", multiple: true, options: memberOptions, separator: "," },
    ],
  });

  //Table Settings below:
  const DTtable = new DataTable("#eventTable", {
    destroy: true,
    dom: "rt",
    scrollX: true,
    data: [],
    columns: [
      { title: "Title", data: "title" },
      { title: "Location", data: "location" },
      {
        title: "Challenge Area",
        data: "challenge_area",
        render: function (data) {
          const option = challengeAreaOptions.find((option) => option.value === data);
          return option ? option.label : "";
        },
      },
      {
        title: "Start",
        data: "startDate",
      },
      {
        title: "End",
        data: "endDate",
      },
      {
        title: "Scout Method",
        data: "scout_method",
        render: function (data) {
          return data
            .split(",")
            .map((item: string) => {
              const method = scoutMethodOptions.find((option) => option.value === item);
              return method ? method.label : "";
            })
            .join(", ");
        },
      },
      {
        title: "Organisers",
        data: "organisers",
        render: function (data) {
          return data
            .split(",")
            .map((id: string) => {
              const member = members.find((member) => member.member_id === id.trim());
              return member ? member.name : "";
            })
            .join(", ");
        },
      },
      {
        title: "Leads",
        data: "leads",
        render: function (data) {
          return data
            .split(",")
            .map((id: string) => {
              const member = members.find((member) => member.member_id === id.trim());
              return member ? member.name : "";
            })
            .join(", ");
        },
      },
      {
        title: "Assists",
        data: "assists",
        render: function (data) {
          return data
            .split(",")
            .map((id: string) => {
              const member = members.find((member) => member.member_id === id.trim());
              return member ? member.name : "";
            })
            .join(", ");
        },
      },
      {
        data: null,
        className: "center",
        defaultContent: '<button class="btn-delete">Delete</button>',
      },
    ],
    select: false,
    searching: false,
    paging: false,
    // buttons: [
    //     { editor: DTEditor },
    // ],
    createdRow: function (row) {
      // Add 'date' class to the start date cell
      $(row).find("td:eq(3)").addClass("date");

      // Add 'date' class to the end date cell
      $(row).find("td:eq(4)").addClass("date");
    },
  });

  interface DTOnEvent extends Event {
    relatedTarget: HTMLElement;
  }
  // Listen for the blur event on inputs in your table
  DTtable.on("focusout", "tr", function (e: Event): void {
    const event = e as DTOnEvent;
    if (!$(event.relatedTarget).closest("tr").is(this) && !$(event.relatedTarget).closest(".flatpickr-calendar").length) {
      DTEditor.submit();
    }
  });

  DTtable.on("click", "tbody td:not(:last-child)", function () {
    const cell = DTtable.cell(this);
    if (cell.length && !$(this).hasClass("date")) {
      DTEditor.inline(this);
    }
  });

  DTtable.on("click", "button.btn-delete", function () {
    DTtable.row($(this).parents("tr")).remove().draw();
  });

  DTtable.on("click", "td.date", function (event) {
    event.stopPropagation();
    const cell = DTtable.cell(this);
    const date = cell.data();
    flatpickr(this, {
      enableTime: true,
      dateFormat: "d/m/Y H:i",
      defaultDate: date,
      onClose: function (selectedDates, dateStr) {
        cell.data(dateStr).draw();
      },
    }).open();
  });

  $("#add").on("click", async function () {
    lastId++; // Increment the ID counter

    // Get the current date and round it to the nearest 30 minutes
    const currentDate = moment();
    currentDate.minutes(Math.round(currentDate.minutes() / 30) * 30).seconds(0);

    // Get the data from the table
    const data = DTtable.data().toArray();

    // If there are existing rows, calculate the start and end dates based on the oldest record
    let startDate, endDate;
    if (data.length > 0) {
      // Find the oldest record
      const oldestRecord = data.reduce((oldest, current) => {
        const currentStartDate = moment(current.startDate, "DD/MM/YYYY HH:mm");
        return currentStartDate.isBefore(moment(oldest.startDate, "DD/MM/YYYY HH:mm")) ? current : oldest;
      });

      // Calculate the start and end dates
      startDate = moment(oldestRecord.startDate, "DD/MM/YYYY HH:mm").add(7, "days");
      endDate = moment(startDate).add(2, "hours");
    } else {
      // If there are no existing rows, set the start date to the current date and the end date to 2 hours later
      startDate = currentDate;
      endDate = moment(currentDate).add(2, "hours");
    }

    // Format the dates to match the format used by Flatpickr
    const formattedStartDate = startDate.format("DD/MM/YYYY HH:mm");
    const formattedEndDate = endDate.format("DD/MM/YYYY HH:mm");

    // Insert a blank row with the next ID and the calculated start and end dates
    DTtable.row
      .add({
        id: lastId,
        title: "",
        location: "",
        challenge_area: "",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        scout_method: "",
        organisers: "",
        leads: "",
        assists: "",
      })
      .draw();
  });

  $("#submit").on("click", async function () {
    $(".errorP").remove();
    $(".loadingP").remove();
    const table = $("#eventTable").DataTable();
    const data = table.rows().data().toArray();

    //show a message that we are going to start processing the records
    $("#submit").after('<p class="loadingP" style="color:green;">Processing Records...</p>');
    //disable buttons
    $("#submit").prop("disabled", true);
    $("#add").prop("disabled", true);

    // Define the fields that need to be validated
    const fieldsToValidate = ["title", "location", "challenge_area", "startDate", "endDate", "scout_method", "organisers", "leads", "assists"];

    // Validate each field of each row
    data.forEach(function (row, rowIndex: number) {
      fieldsToValidate.forEach(function (field, colIndex) {
        if (row[field] == "") {
          // Invalidate the cell
          table.cell(rowIndex as unknown as CellSelector, colIndex).invalidate();
        }
      });

      // Check valid date
      if (row.startDate == "" || !moment(row.startDate, "DD/MM/YYYY HH:mm").isValid()) {
        // Invalidate the cell
        table.cell(rowIndex as unknown as CellSelector, fieldsToValidate.indexOf("startDate")).invalidate();
      }

      // Also check if it is after the start date and if the date is valid
      if (row.endDate == "" || !moment(row.endDate, "DD/MM/YYYY HH:mm").isValid() || moment(row.endDate, "DD/MM/YYYY HH:mm").isBefore(moment(row.startDate, "DD/MM/YYYY HH:mm"))) {
        // Invalidate the cell
        table.cell(rowIndex as unknown as CellSelector, fieldsToValidate.indexOf("endDate")).invalidate();
      }
    });

    if (table.cells(".dataTables_invalid").any()) {
      // Redraw the table if there is any invalid data
      table.draw();
      $("#submit").after('<p class="errorP" style="color:red;">Please fix the errors above.</p>');
      setTimeout(function () {
        $(".errorP").remove();
      }, 3000);
      return;
    }

    //loop through the data and create the objects for each entry and call createNewEvent(bodyJson);
    //json object should have {"title":"test title","description":"","justification":"","organisers":["83eb42ec-b2d6-31fc-b872-21ae4aa9f2e7"],"challenge_area":"community","start_datetime":"2023-12-29T14:00:00.000+00:00","end_datetime":"2023-12-29T15:01:00.000+00:00","event_type":{"type":"unit","id":"3603056b-3928-4f66-b12e-421ca4434dcb"},"attendance":{"leader_member_ids":["835738d1-fc06-3a9e-8fbe-02367dbfc93c"],"assistant_member_ids":["e0f233d7-090a-39cc-a446-8e7ef147588b"],"attendee_member_ids":[],"participant_member_ids":[]},"schedule_items":[{"start_datetime":"","end_datetime":"","description":"","leader_notes":"","assistant_notes":""}],"achievement_pathway_oas_data":{"award_rule":"individual","verifier":{"name":"Brodie Royle","contact":"","type":"member"},"groups":[]},"achievement_pathway_logbook_data":{"distance_travelled":0,"distance_walkabout":0,"achievement_meta":{"stream":"","branch":""},"categories":[],"details":{"activity_time_length":"","activity_grade":""},"verifier":{"name":"Brodie Royle","contact":"","type":"member"}},"review":{"general_tags":[],"scout_method_elements":["community_involvement"],"scout_spices_elements":[]},"uploads":[],"equipment_notes":"","additional_notes":"","location":"test location","iana_timezone":"Australia/Brisbane","status":"planned"}
    let isError = false;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      // Create the object for the event
      const event = {
        title: row.title,
        description: "",
        justification: "",
        organisers: row.organisers.split(","),
        challenge_area: row.challenge_area,
        start_datetime: moment(row.startDate, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        end_datetime: moment(row.endDate, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
        event_type: {
          type: "unit",
          id: context.currentProfile?.unit.id,
        },
        attendance: {
          leader_member_ids: row.leads.split(","),
          assistant_member_ids: row.assists.split(","),
          attendee_member_ids: [],
          participant_member_ids: [],
        },
        schedule_items: [
          {
            start_datetime: "",
            end_datetime: "",
            description: "",
            leader_notes: "",
            assistant_notes: "",
          },
        ],
        achievement_pathway_oas_data: {
          award_rule: "individual",
          verifier: {
            name: members.find((member) => member.member_id === row.leads.split(",")[0])?.name,
            contact: "",
            type: "member",
          },
          groups: [],
        },
        achievement_pathway_logbook_data: {
          distance_travelled: 0,
          distance_walkabout: 0,
          achievement_meta: {
            stream: "",
            branch: "",
          },
          categories: [],
          details: {
            activity_time_length: "",
            activity_grade: "",
          },
          verifier: {
            name: members.find((member) => member.member_id === row.leads.split(",")[0])?.name,
            contact: "",
            type: "member",
          },
        },
        review: {
          general_tags: [],
          scout_method_elements: row.scout_method.split(","),
          scout_spices_elements: [],
        },
        uploads: [],
        equipment_notes: "",
        additional_notes: "",
        location: row.location,
        iana_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: "planned",
      };

      // Create the event with try/catch to handle errors and pass event as string for body
      try {
        const errorMsg = (await createNewEvent(JSON.stringify(event), context)) as { message: string } | undefined;
        if (errorMsg) {
          isError = true;
          // add error message to dom
          $("#submit").after('<p class="errorP" style="color:red;">Error: ' + errorMsg.message + "</p>");
          continue;
        }
      } catch (error) {
        isError = true;
        // add error message to dom
        $("#submit").after('<p class="errorP" style="color:red;">Error: ' + JSON.stringify(error) + "</p>");
      }
    }
    //call this function again to reset the page
    $("#submit").prop("disabled", false);
    $("#add").prop("disabled", false);
    $(".loadingP").text("Records with errors have not been processed. Please fix the errors and try again. Missing records have been processed successfully and have been removed.");
    if (!isError) bulkCalendar("All Records Processed Successfully!");
  });
}
