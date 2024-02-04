<template>
  <div>
    <h2 id="bulkHeader">Bulk Calender Events</h2>
  <p>Welcome to our Bulk Calendar Events Form. This simple interface allows you to efficiently manage and schedule multiple
    events with ease.<br>
    Use the 'Add Item' button to insert new events. To edit event details, simply click on the desired field in the
    table. This will activate the inline editor, enabling you to input or modify information directly within the row.
    After making changes, click elsewhere to save your updates automatically. <b>NB:</b> For Scout Method, Organisers, Leads,
    and Assists you can add multiple by holding CRTL while clicking the options.</p>
  <p>Once you have set the first entry the start and end date will pick the same date and time 7 days later helping you
    to complete you full term plan.</p>
    <div ref="reactRoot"></div>
  </div>
</template>

<script lang="ts" src="./SummitCalendar.ts">
</script>

<style scoped>

</style>