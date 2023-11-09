async function bulkCalendar(){
    let lastId = 0;  // Used to increment the ID for new records
    //load the initial html content into the container
    summitLoadPage(
        "SUMMIT REPORTS - BULK CALENDAR FORM", 
        `
        <h2>Bulk Calender Form</h2>
        <table id="eventTable" class="display" width="100%"></table>
        <button id="submit">Submit</button>
        `
    );

    // Fetch members for Organisers, Leaders, and Assists columns
    const members = await fetchMembers();
    const memberOptions = members.map(member => ({
        label: member.name,
        value: member.member_id,
    }));

    let editor = new $.fn.dataTable.Editor({
        table: '#eventTable',
        idSrc:  "id",
        fields: [
          { label: 'Title', name: 'title' },
          { label: 'Location', name: 'location' },
          { label: 'Challenge Area', name: 'challenge_area', type: 'select', options: ['community', 'outdoor', 'creative', 'personal_growth'] },
          { label: 'Start', name: 'startDate', type: 'datetime', format: 'DD/MM/YYYY HH:mm'},
          { label: 'End', name: 'endDate', type: 'datetime', format: 'DD/MM/YYYY HH:mm' },
          { label: 'Scout Method', name: 'scout_method', type: 'select', options: ['community_involvement', 'learn_by_doing', 'nature_and_outdoors'], separator: ',' },
          { label: 'Organisers', name: 'organisers', type: 'select', multiple: true, options: memberOptions, separator: ',' },
          { label: 'Leads', name: 'leads', type: 'select', multiple: true, options: memberOptions, separator: ',' },
          { label: 'Assists', name: 'assists', type: 'select', multiple: true, options: memberOptions, separator: ',' }
        ]
    });
    editor.on('preCreate', function ( e, json, data ) {
        lastId++;  // Increment the ID counter
        json.data[0].id = lastId;  // Set the ID for the new record
    });

    let table = $('#eventTable').DataTable({
    dom: "Bfrtip",
    data: [
        {
            id: 0,
            title: "",
            location: "",
            challenge_area: "",
            startDate: "",
            endDate: "",
            scout_method: [],
            organisers: [],
            leads: [],
            assists: []
        }
    ],
    columns: [
        { title: 'Title', data: 'title' },
        { title: 'Location', data: 'location' },
        { title: 'Challenge Area', data: 'challenge_area' },
        { title: 'Start', data: 'startDate' },
        { title: 'End', data: 'endDate' },
        { title: 'Scout Method', data: 'scout_method' },
        { title: 'Organisers', data: 'organisers' },
        { title: 'Leads', data: 'leads' },
        { title: 'Assists', data: 'assists' }
    ],
    select: {
        style: 'os',
        selector: 'td:first-child'
    },
    buttons: [
        { extend: 'createInline', editor },
        { extend: 'remove', editor }
    ]
    });
    
    table.on('click', 'tbody td:not(:first-child)', function (e) {
        editor.inline(this);
    });

    $('#submit').click(function () {
        const data = $('#eventTable').DataTable().rows().data().toArray();
        // Perform data verification and JSON formatting here
        console.log(data);
    });
}
  

