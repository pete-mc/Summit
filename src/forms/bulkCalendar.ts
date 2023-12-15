import moment from 'moment'
import { SummitContext } from "../summitContext";
import { summitLoadPage } from "../summitMenu";
import { createNewEvent, fetchUnitMembers } from "../terrainCalls";
import flatpickr from "flatpickr";
import Editor from "@datatables.net/editor-dt";
import DataTable from "datatables.net-dt"
import "datatables.net-select-dt";
import "datatables.net-buttons-dt";
import "@datatables.net/editor-dt";
import $ from 'jquery';

export async function bulkCalendar(context: SummitContext){
    let lastId = 0;  // Used to increment the ID for new records
    let challengeAreaOptions = [
        { label: 'Community', value: 'community' },
        { label: 'Outdoor', value: 'outdoor' },
        { label: 'Creative', value: 'creative' },
        { label: 'Personal Growth', value: 'personal_growth' }
    ];
    
    let scoutMethodOptions = [
        { label: 'Community Involvement', value: 'community_involvement' },
        { label: 'Learn by Doing', value: 'learn_by_doing' },
        { label: 'Nature and Outdoors', value: 'nature_and_outdoors' }
    ];
    //load the initial html content into the container
    summitLoadPage(
        "SUMMIT REPORTS - BULK CALENDAR FORM", 
        `
        <h2>Bulk Calender Form</h2>
        <p id="loadingP">Loading Please Wait...</p>
        <table id="eventTable" class="display" width="100%"></table>
        <button id="add" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Add Item</button> <button id="submit" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Submit</button>
        `
    );

    // Fetch members for Organisers, Leaders, and Assists columns
    $("#submit").hide();
    $("#add").hide();
    const members = await fetchUnitMembers(context);

    //remove loading text and show button
    $("#loadingP").remove();
    $("#submit").show();
    $("#add").show();

    const memberOptions = members.map(member => ({
        label: member.name,
        value: member.member_id,
    }));
    
    // editor settings below:
    let DTEditor = new Editor({
        table: '#eventTable',
        idSrc:  "id",
        fields: [
            { label: 'Title', name: 'title' },
            { label: 'Location', name: 'location' },
            { 
                label: 'Challenge Area', 
                name: 'challenge_area', 
                type: 'select', 
                options: challengeAreaOptions
            },
            { label: 'Start', name: 'startDate', type: 'text', attr: { readonly: 'readonly' } },
            { label: 'End', name: 'endDate', type: 'text', attr: { readonly: 'readonly' } },         
            { 
                label: 'Scout Method', 
                name: 'scout_method', 
                type: 'select', 
                options: scoutMethodOptions,
                separator: ',' 
            },
            { label: 'Organisers', name: 'organisers', type: 'select', multiple: true, options: memberOptions, separator: ',' },
            { label: 'Leads', name: 'leads', type: 'select', multiple: true, options: memberOptions, separator: ',' },
            { label: 'Assists', name: 'assists', type: 'select', multiple: true, options: memberOptions, separator: ',' }
        ]
    });

    //Table Settings below:
    let DTtable = new DataTable('#eventTable' ,{
    dom: "Bfrtip",
    scrollX: true,
    data: [],
    columns: [
        { title: 'Title', data: 'title' },
        { title: 'Location', data: 'location' },
        { 
            title: 'Challenge Area', 
            data: 'challenge_area',
            render: function (data, type, row) {
                let option = challengeAreaOptions.find(option => option.value === data);
                return option ? option.label : '';
            }
        },
        { 
            title: 'Start', 
            data: 'startDate'
        },
        { 
            title: 'End', 
            data: 'endDate'
        },
        { 
            title: 'Scout Method', 
            data: 'scout_method',
            render: function (data, type, row) {
                let option = scoutMethodOptions.find(option => option.value === data);
                return option ? option.label : '';
            }
        },
        {
            title: 'Organisers',
            data: 'organisers',
            render: function (data, type, row) {
                return data.split(',').map((id: string) => {
                    let member = members.find(member => member.member_id === id.trim());
                    return member ? member.name : '';
                }).join(', ');
            }
        },
        {
            title: 'Leads',
            data: 'leads',
            render: function (data, type, row) {
                return data.split(',').map((id: string) => {
                    let member = members.find(member => member.member_id === id.trim());
                    return member ? member.name : '';
                }).join(', ');
            }
        },
        {
            title: 'Assists',
            data: 'assists',
            render: function (data, type, row) {
                return data.split(',').map((id: string) => {
                    let member = members.find(member => member.member_id === id.trim());
                    return member ? member.name : '';
                }).join(', ');
            }
        },
        {
            data: null,
            className: "center",
            defaultContent: '<button class="btn-delete">Delete</button>'
        }
    ],
    select: false,
    // buttons: [
    //     { editor: DTEditor },
    // ],
    createdRow: function (row, data, dataIndex) {
        // Add 'date' class to the start date cell
        $(row).find('td:eq(3)').addClass('date');

        // Add 'date' class to the end date cell
        $(row).find('td:eq(4)').addClass('date');
    },
    });
    // Listen for the blur event on inputs in your table
    DTtable.on('focusout', 'tr', function (e: any) {
        if (!$(e.relatedTarget).closest('tr').is(this) && 
            !$(e.relatedTarget).closest('.flatpickr-calendar').length) {
            DTEditor.submit();
        }
    });

    DTtable.on('click', 'tbody td:not(:last-child)', function (e) {
        let cell = DTtable.cell(this);
        if (cell.length && !$(this).hasClass('date')) {
            DTEditor.inline(this);
        }
    });

    DTtable.on('click', 'button.btn-delete', function () {
        DTtable.row($(this).parents('tr')).remove().draw();
    });


    DTtable.on('click', 'td.date', function (event) {
        event.stopPropagation();
        let cell = DTtable.cell(this);
        let date = cell.data();
        flatpickr(this, {
            enableTime: true,
            dateFormat: "d/m/Y H:i",
            defaultDate: date,
            onClose: function(selectedDates, dateStr, instance) {
                cell.data(dateStr).draw();
            },
        }).open();
    });

    $('#add').on("click",function () {
        lastId++;  // Increment the ID counter

        // Get the current date and round it to the nearest 30 minutes
        let currentDate = moment();
        currentDate.minutes(Math.round(currentDate.minutes() / 30) * 30).seconds(0);

        // Get the data from the table
        let data = DTtable.data().toArray();

        // If there are existing rows, calculate the start and end dates based on the oldest record
        let startDate, endDate;
        if (data.length > 0) {
            // Find the oldest record
            let oldestRecord = data.reduce((oldest, current) => {
                let currentStartDate = moment(current.startDate, "DD/MM/YYYY HH:mm");
                return currentStartDate.isBefore(moment(oldest.startDate, "DD/MM/YYYY HH:mm")) ? current : oldest;
            });

            // Calculate the start and end dates
            startDate = moment(oldestRecord.startDate, "DD/MM/YYYY HH:mm").add(7, 'days');
            endDate = moment(startDate).add(2, 'hours');
        } else {
            // If there are no existing rows, set the start date to the current date and the end date to 2 hours later
            startDate = currentDate;
            endDate = moment(currentDate).add(2, 'hours');
        }

        // Format the dates to match the format used by Flatpickr
        let formattedStartDate = startDate.format("DD/MM/YYYY HH:mm");
        let formattedEndDate = endDate.format("DD/MM/YYYY HH:mm");

        // Insert a blank row with the next ID and the calculated start and end dates
        DTtable.row.add({
            id: lastId,
            title: '',
            location: '',
            challenge_area: '',
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            scout_method: '',
            organisers: '',
            leads: '',
            assists: ''
        }).draw();
    });

    $('#submit').on("click", function () {
        const table = $('#eventTable').DataTable();
        const data = table.rows().data().toArray();

        // Define the fields that need to be validated
        let fieldsToValidate = ['title', 'location', 'challenge_area', 'startDate', 'endDate', 'scout_method', 'organisers', 'leads', 'assists'];

        // Validate each field of each row
        data.forEach(function (row, rowIndex: any) {
            fieldsToValidate.forEach(function (field, colIndex) {
                if (row[field] == "") {
                    // Invalidate the cell
                    table.cell(rowIndex, colIndex).invalidate();
                }
            });

            // Check valid date
            if (row.startDate == "" || !moment(row.startDate, "DD/MM/YYYY HH:mm").isValid()) {
                // Invalidate the cell
                table.cell(rowIndex, fieldsToValidate.indexOf('startDate')).invalidate();
            }

            // Also check if it is after the start date and if the date is valid
            if (row.endDate == "" || !moment(row.endDate, "DD/MM/YYYY HH:mm").isValid() || moment(row.endDate, "DD/MM/YYYY HH:mm").isBefore(moment(row.startDate, "DD/MM/YYYY HH:mm"))) {
                // Invalidate the cell
                table.cell(rowIndex, fieldsToValidate.indexOf('endDate')).invalidate();
            }
        });

        
        if (table.cells('.dataTables_invalid').any()) {
            // Redraw the table if there is any invalid data
            table.draw();
            $("#submit").after('<p id="errorP" style="color:red;">Please fix the errors above.</p>');
            setTimeout(function(){
                $("#errorP").remove();
            }, 3000);
            return;
        }
        //show a message that we are going to start processing the records
        $("#submit").after('<p id="loadingP" style="color:green;">Processing Records...</p>');
        //disable buttons
        $("#submit").prop("disabled", true);
        $("#add").prop("disabled", true);

        //loop through the data and create the objects for each entry and call createNewEvent(bodyJson);
        //json object should have {"title":"test title","description":"","justification":"","organisers":["83eb42ec-b2d6-31fc-b872-21ae4aa9f2e7"],"challenge_area":"community","start_datetime":"2023-12-29T14:00:00.000+00:00","end_datetime":"2023-12-29T15:01:00.000+00:00","event_type":{"type":"unit","id":"3603056b-3928-4f66-b12e-421ca4434dcb"},"attendance":{"leader_member_ids":["835738d1-fc06-3a9e-8fbe-02367dbfc93c"],"assistant_member_ids":["e0f233d7-090a-39cc-a446-8e7ef147588b"],"attendee_member_ids":[],"participant_member_ids":[]},"schedule_items":[{"start_datetime":"","end_datetime":"","description":"","leader_notes":"","assistant_notes":""}],"achievement_pathway_oas_data":{"award_rule":"individual","verifier":{"name":"Brodie Royle","contact":"","type":"member"},"groups":[]},"achievement_pathway_logbook_data":{"distance_travelled":0,"distance_walkabout":0,"achievement_meta":{"stream":"","branch":""},"categories":[],"details":{"activity_time_length":"","activity_grade":""},"verifier":{"name":"Brodie Royle","contact":"","type":"member"}},"review":{"general_tags":[],"scout_method_elements":["community_involvement"],"scout_spices_elements":[]},"uploads":[],"equipment_notes":"","additional_notes":"","location":"test location","iana_timezone":"Australia/Brisbane","status":"planned"}

        data.forEach(async function (row, rowIndex: any) {
            // Create the object for the event
            let event = {
                title: row.title,
                description: '',
                justification: '',
                organisers: row.organisers.split(','),
                challenge_area: row.challenge_area,
                start_datetime: moment(row.startDate, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
                end_datetime: moment(row.endDate, "DD/MM/YYYY HH:mm").format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
                event_type: {
                    type: 'unit',
                    id: context.currentProfile.profiles[0].unit.id
                },
                attendance: {
                    leader_member_ids: row.leads.split(','),
                    assistant_member_ids: row.assists.split(','),
                    attendee_member_ids: [],
                    participant_member_ids: []
                },
                schedule_items: [{
                    start_datetime: '',
                    end_datetime: '',
                    description: '',
                    leader_notes: '',
                    assistant_notes: ''
                }],
                achievement_pathway_oas_data: {
                    award_rule: 'individual',
                    verifier: {
                        name: members.find(member => member.member_id === row.leads.split(',')[0])?.name,
                        contact: '',
                        type: 'member'
                    },
                    groups: []
                },
                achievement_pathway_logbook_data: {
                    distance_travelled: 0,
                    distance_walkabout: 0,
                    achievement_meta: {
                        stream: '',
                        branch: ''
                    },
                    categories: [],
                    details: {
                        activity_time_length: '',
                        activity_grade: ''
                    },
                    verifier: {
                        name: members.find(member => member.member_id === row.leads.split(',')[0])?.name,
                        contact: '',
                        type: 'member'
                    }
                },
                review: {
                    general_tags: [],
                    scout_method_elements: row.scout_method.split(','),
                    scout_spices_elements: []
                },
                uploads: [],
                equipment_notes: '',
                additional_notes: '',
                location: row.location,
                iana_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                status: 'planned'
            };

            // Create the event with try/catch to handle errors and pass event as string for body
            try {
                await createNewEvent(JSON.stringify(event), context);
            } catch (error) {
                console.log(error);
                //mark the row as red
                table.row(rowIndex).invalidate();
                //add a message to the row as a new column if it does not exist
                if (table.column(10).header().innerHTML !== "Error"){
                    table.column(10).header().innerHTML = "Error";
                }
                table.cell(rowIndex, 10).data(error);               
            } 
        });
        //call this function again to reset the page
        bulkCalendar(context);
    });
}
  

