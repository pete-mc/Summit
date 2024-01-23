<template>
  <div id="presentAwardsDiv">
      <h2 id="presentAwards">Record Badge Presentations</h2>
      <p>Welcome to the Awards Presentation page. Here, you can manage the presentation of awards to youth members. Please
          note that marking an award as 'Presented' here signifies that the award has actually been handed over to the youth
          member. This is different from the 'Awarded' status, which indicates that the member has earned the award but may
          not have received it yet. Remember to <b>save your changes</b> after presenting awards to ensure the information is
          updated correctly.</p>
      <p id="loadingP">Loading data from Terrian please wait...</p>
      <div id="buttons" class="row no-gutters justify-end">
          <button class="savebtn mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Save Changes</button>
      </div>
      <table id="awardsTable" class="display" width="100%"></table>
      <div id="buttons_footer" class="row no-gutters justify-end">
          <br>
          <button class="savebtn mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Save Changes</button>
      </div>
  </div>
</template>

<!-- The rest of your script and style tags remain the same -->
<script lang="ts">
// import { createNewEvent, fetchActivity, fetchMemberEvents, fetchSIATemplate, fetchUnitAchievements, fetchUnitMembers, updateEvent } from '../helpers/terrainCalls';
// import 'datatables.net-dt';
// import 'datatables.net-buttons-dt';
// import 'datatables.net-buttons/js/buttons.html5.js';
// import 'datatables.net-buttons/js/buttons.print.js';
// import 'datatables.net-rowgroup-dt';
// import { TerrainEvent } from '../types/terrainTypes';
// import { processGuids, reconstructGuids } from '../helpers';
// import moment from "moment";
// import { siaTypes } from '../constants/siaTypes';

// export default {
  // data() {
  //   return {
  //     loading: true,
  //     tableData: []
  //   };
  // },
  // async created() {
  //   try {
//       enum TerrainAchievementsType {
//         AdditionalAward = "additional_award",
//         AdventurousJourney = "adventurous_journey",
//         CourseReflection = "course_reflection",
//         IntroScouting = "intro_scouting",
//         IntroSection = "intro_section",
//         Milestone = "milestone",
//         OutdoorAdventureSkill = "outdoor_adventure_skill",
//         PeakAward = "peak_award",
//         PersonalReflection = "personal_reflection",
//         SpecialInterestArea = "special_interest_area",
//       }
//       $(".savebtn").hide();
//       const members = await fetchUnitMembers();
//       const achievements = await fetchUnitAchievements();
//       const memberEvents = await fetchMemberEvents("2100-01-01T00:00:00", "2100-01-30T00:00:00");
//       if (!members || !achievements) {
//         $("#loadingP").text(
//           "Error loading members. Please click the button to try again. This is a Summit error. Please do not contact Terrain support for this issue. If this error persists please add an issue to the Summit GitHub repository. ",
//         );
//         $("#retry").remove();
//         $("#github").remove();
//         $("#loadingP").after('<button id="retry" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Retry</button>');
//         $("#loadingP").after(
//           '<a id="github" href="https://github.com/pete-mc/Summit/issues" target="_blank"><button class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Summit Issues Register</button></a>',
//         );
//         $("#retry").on("click", async function () {
//           // $("#presentAwardsDiv").text(PresentAwardsHtml);
//           // presentAwards();
//           // try loading data again, might need to store data in state and pass to datatables
//         });
//         return;
//       }
//       $("#presentAwards").text("Record Badge Presentations - " + window.$nuxt.$store.state.me.currentUnit.name);
//       $("#loadingP").remove();
//       $("#retry").remove();
//       $("#github").remove();

//       let existingEvent = undefined as TerrainEvent | undefined;
//       const existingEventId = memberEvents?.find((event) => event.title === "Summit Award Storage - Please Ignore" && event.invitee_id === window.$nuxt.$store.state.me.currentUnit.id)?.id;
//       if (existingEventId) {
//         existingEvent = await fetchActivity(existingEventId);
//       }
//       const existingAwards = existingEvent && existingEvent.schedule_items ? existingEvent.schedule_items.flatMap((item) => item.description) : [];
//       const existingGuids = reconstructGuids(existingAwards);
//       const awardedAchievements = achievements
//         .filter((achievement) => achievement.status === "awarded")
//         .map((achievement) => {
//           const member = members.find((member) => member.id === achievement.member_id);
//           let section = achievement.section?.replace(/-/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase()));
//           section = section ? section + "s" : "";
//           const getName = () => {
//             switch (achievement.type) {
//               case TerrainAchievementsType.AdditionalAward:
//                 return achievement.achievement_meta?.additional_award_id?.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? "Additional Award";
//               case TerrainAchievementsType.AdventurousJourney:
//                 return `Adventurous Journey (${section})`;
//               case TerrainAchievementsType.CourseReflection:
//                 return `LS/PD Course (${section})`;
//               case TerrainAchievementsType.IntroScouting:
//                 return "Introduction to Scouting";
//               case TerrainAchievementsType.IntroSection:
//                 return `Introduction to ${section ?? "Section"}`;
//               case TerrainAchievementsType.Milestone:
//                 return `Milestone ${achievement.achievement_meta?.stage} (${section})`;
//               case TerrainAchievementsType.OutdoorAdventureSkill:
//                 return `${achievement.achievement_meta?.branch?.replace(/-/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? "Outdoor Adventure Skill"} ${achievement.achievement_meta?.stage}`;
//               case TerrainAchievementsType.PeakAward:
//                 return `Peak Award (${section})`;
//               case TerrainAchievementsType.PersonalReflection:
//                 return `${section ?? "Reflection"}`;
//               case TerrainAchievementsType.SpecialInterestArea:
//                 return `${achievement.answers && achievement.answers.special_interest_area_selection ? siaTypes.find((s) => s.id === achievement.answers?.special_interest_area_selection)?.title : "Special Interest Area"} (${section})`;
//               default:
//                 return "Unknown Achievement";
//             }
//           };
//           return {
//             id: achievement.id,
//             memberid: achievement.member_id,
//             member: member?.first_name + " " + member?.last_name,
//             type: achievement.type.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())),
//             achievementName: getName(),
//             dateAwarded: moment(achievement.status_updated).format("DD/MM/YYYY"),
//             presented: existingGuids.includes(achievement.id),
//           }
//         });

//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       const table = $("#awardsTable").DataTable({
//         destroy: true,
//         data: awardedAchievements,
//         pageLength: 5000,
//         order: [
//           [2, "asc"],
//           [3, "asc"],
//         ],
//         columns: [
//           { title: "ID", data: "id", visible: false },
//           { title: "MemberID", data: "memberid", visible: false },
//           { title: "Member", data: "member", visible: false },
//           { title: "Type", data: "type" },
//           { title: "Achievement", data: "achievementName" },
//           { title: "Date Awarded", data: "dateAwarded" },
//           {
//             title: "Presented",
//             data: "presented",
//             render: function (data) {
//               return data ? "Yes" : "No";
//             },
//           },
//           { title: "Present", data: null },
//         ],
//         columnDefs: [
//           {
//             orderable: false,
//             targets: 7,
//             data: null,
//             defaultContent:
//               '<button class="present mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small summit-btn" style="min-width: 0;margin: 0px !important;padding: 0px 8px;font-size: 0.6rem;height: 30px !important;">Present</button>',
//           },
//         ],
//         dom: "rt",
//         buttons: ["excel", "pdf"],
//         searching: true,
//         rowGroup: {
//           dataSrc: "member",
//           startRender: function (rows, group) {
//             return $('<tr id="' + group + '"/>').append(
//               '<td colspan="8"><b>' +
//                 group +
//                 '</b><button class="presentall mr-4 v-btn v-btn--outlined theme--light v-size--small summit-menu-outline" style="min-width: 0;margin: 0px !important;padding: 0px 8px;font-size: 0.6rem;height: 30px !important; margin-left: 75px !important;">Present All</button></td>',
//             );
//           },
//         },
//       });
//       table.columns(6).search("^No$", true, false).draw();
//       $("#buttons").append('<button id="hidePresented" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Show Presented</button>');
//       $("#hidePresented").on("click", function () {
//         if ($("#hidePresented").text() === "Hide Presented") {
//           $("#hidePresented").text("Show Presented");
//           table.columns(6).search("No").draw();
//         } else {
//           $("#hidePresented").text("Hide Presented");
//           table.columns(6).search("").draw();
//         }
//       });

//       $(".savebtn").show();

//       $("#awardsTable tbody").on("click", "button.present", function () {
//         const data = table.row($(this).parents("tr")).data();
//         data.presented = !data.presented;
//         table.row($(this).parents("tr")).invalidate().draw();
//       });

//       $("#awardsTable").on("click", "button.presentall", function () {
//         const group = $(this).closest("tr").attr("id");
//         const rows = table.rows().nodes();
//         $(rows).each(function (index, element) {
//           const row = table.row(element);
//           const data = row.data();
//           if (data && data.member === group) {
//             data.presented = true;
//             row.invalidate().draw();
//           }
//         });
//       });

//       $(".savebtn").on("click", function () {
//         let presentedIds = [] as { memberid: string; membername: string; awards: string[] }[];;
//         const rows = table.rows().nodes();
//         $(rows).each(function (index, element) {
//           const row = table.row(element);
//           const data = row.data();
//           if (data && data.presented) {
//             const member = presentedIds.find((member) => member.memberid === data.memberid);
//             if (member) {
//               member.awards.push(data.id);
//             } else {
//               presentedIds.push({ memberid: data.memberid, membername: data.member, awards: [data.id] });
//             }
//           }
//         });

//         presentedIds = presentedIds.map((idArray) => {
//           return { memberid: idArray.memberid, membername: idArray.membername, awards: processGuids(idArray.awards) };
//         });
//         const eventToUpload = {
//           schedule_items: presentedIds
//             .flatMap((idArray) => {
//               return idArray.awards.map((award) => {
//                 return { memberid: idArray.memberid, membername: idArray.membername, awards: award };
//               });
//             })
//             .map((idArray) => {
//               return {
//                 start_datetime: moment().format(),
//                 end_datetime: moment().format(),
//                 description: idArray.awards,
//                 leader_notes: idArray.memberid,
//                 assistant_notes: idArray.membername,
//               };
//             }),
//           title: "Summit Award Storage - Please Ignore",
//           achievement_pathway_logbook_data: {
//             achievement_meta: {
//               stream: "",
//               branch: "",
//             },
//           },
//           achievement_pathway_oas_data: {
//             award_rule: "individual",
//             verifier: {
//               name: "Not Applicable",
//               contact: "",
//               type: "member",
//             },
//             groups: [],
//           },
//           attendance: {
//             leader_member_ids: [],
//             assistant_member_ids: [],
//             attendee_member_ids: [],
//             participant_member_ids: [],
//           },
//           challenge_area: "creative",
//           description: "This is for keeping track of badges that have been presented, please do not modify this event or delete it.",
//           end_datetime: "2100-01-10T03:00:00.000+00:00",
//           equipment_notes: "",
//           event_type: { type: "unit", id: window.$nuxt.$store.state.me.currentUnit.id },
//           type: "unit",
//           iana_timezone: "Australia/Brisbane",
//           justification: "",
//           location: "Summit Award Storage ",
//           organisers: [window.$nuxt.$store.state.user.profiles[window.$nuxt.$store.state.user.profileIndex].member.id],
//           review: { general_tags: [], scout_method_elements: ["symbolic_framework"], scout_spices_elements: [] },
//           start_datetime: "2100-01-10T02:00:00.000+00:00",
//           status: "planned",
//           uploads: [],
//         };
//         if (existingEvent && existingEvent.id) {
//           updateEvent(existingEvent.id, JSON.stringify(eventToUpload));
//         } else {
//           createNewEvent(JSON.stringify(eventToUpload));
//         }
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   },
//   mounted() {

//   },
//   beforeDestroy() {
//     $('#awardsTable').DataTable().destroy(true);
//   },
// };
</script>

<style scoped>

</style>