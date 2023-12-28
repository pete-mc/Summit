/* eslint-disable @typescript-eslint/no-unused-vars */
import { SummitContext } from "../../summitContext";
import "datatables.net-select-dt";
import "datatables.net-buttons-dt";
import "@datatables.net/editor-dt";
import "datatables.net-rowgroup";
import "datatables.net-buttons";
import "datatables.net-buttons-dt";
import $ from "jquery";
import presentAwardHTML from "raw-loader!./presentAwards.html";
import { createNewEvent, fetchActivity, fetchMemberEvents, fetchUnitAchievements, fetchUnitMembers, updateEvent } from "../../terrainCalls";
import moment from "moment";
import { SummitAchievementData } from "../../../typings/summitTypes";
import { processGuids, reconstructGuids } from "../../helpers";
import { TerrainEvent, TerrainEventScheduleItem } from "../../../typings/terrainTypes";

export const presentAwardHtml = presentAwardHTML;

export async function presentAwards(): Promise<void> {
  enum TerrainAchievementsType {
    AdditionalAward = "additional_award",
    AdventurousJourney = "adventurous_journey",
    CourseReflection = "course_reflection",
    IntroScouting = "intro_scouting",
    IntroSection = "intro_section",
    Milestone = "milestone",
    OutdoorAdventureSkill = "outdoor_adventure_skill",
    PeakAward = "peak_award",
    PersonalReflection = "personal_reflection",
    SpecialInterestArea = "special_interest_area",
  }
  const context = SummitContext.getInstance();
  $(".savebtn").hide();
  const members = await fetchUnitMembers();
  const achievements = await fetchUnitAchievements();
  const memberEvents = await fetchMemberEvents("2100-01-01T00:00:00", "2100-01-30T00:00:00");
  if (!members || !context.currentProfile || !achievements) {
    $("#loadingP").text(
      "Error loading members. Please click the button to try again. This is a Summit error. Please do not contact Terrain support for this issue. If this error persists please add an issue to the Summit GitHub repository. ",
    );
    $("#loadingP").after('<button id="retry" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Retry</button>');
    $("#loadingP").after(
      '<a id="github" href="https://github.com/pete-mc/Summit/issues" target="_blank"><button class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Summit Issues Register</button></a>',
    );
    $("#retry").on("click", async function () {
      !context.currentProfile ? await context.getData() : undefined;
      presentAwards();
    });
    return;
  }
  $("#presentAwards").text(context.currentProfile.profiles[0].unit.name);
  $("#loadingP").remove();
  $("#retry").remove();
  $("#github").remove();

  let existingEvent = undefined as TerrainEvent | undefined;
  const existingEventId = memberEvents?.find((event) => event.title === "Summit Award Storage - Please Ignore" && event.invitee_id === context.currentProfile?.profiles[0].unit.id)?.id;
  if (existingEventId) {
    existingEvent = await fetchActivity(existingEventId);
  }
  const existingAwards = existingEvent && existingEvent.schedule_items ? existingEvent.schedule_items.flatMap((item) => item.description) : [];
  const existingGuids = reconstructGuids(existingAwards);
  const awardedAchievements = achievements
    .filter((achievement) => achievement.status === "awarded")
    .map((achievement) => {
      const member = members.find((member) => member.id === achievement.member_id);
      const getName = (): string => {
        switch (achievement.type) {
          case TerrainAchievementsType.AdditionalAward:
            return achievement.achievement_meta?.additional_award_id?.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? "Additional Award";
          case TerrainAchievementsType.AdventurousJourney:
            return "Adventurous Journey";
          case TerrainAchievementsType.CourseReflection:
            return "Reflection";
          case TerrainAchievementsType.IntroScouting:
            return "Introduction to Scouting";
          case TerrainAchievementsType.IntroSection:
            return "Introduction to Section";
          case TerrainAchievementsType.Milestone:
            return "Milestone " + achievement.achievement_meta?.stage;
          case TerrainAchievementsType.OutdoorAdventureSkill:
            return achievement.achievement_meta?.branch?.replace(/-/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())) ?? "Outdoor Adventure Skill";
          case TerrainAchievementsType.PeakAward:
            return "Peak Award";
          case TerrainAchievementsType.PersonalReflection:
            return "Reflection";
          case TerrainAchievementsType.SpecialInterestArea:
            let siaName = "SIA";
            if (Array.isArray(achievement.answers)) {
              siaName = siaName + " - " + achievement.answers.find((answer) => answer.question_id === "project_name")?.answer;
            }
            return siaName;
          default:
            return "Unknown Achievement";
        }
      };
      return {
        id: achievement.id,
        memberid: achievement.member_id,
        member: member?.first_name + " " + member?.last_name,
        type: achievement.type.replace(/_/g, " ").replace(/\w\S*/g, (w) => w.replace(/^\w/, (c) => c.toUpperCase())),
        achievementName: getName(),
        dateAwarded: moment(achievement.status_updated).format("DD/MM/YYYY"),
        presented: existingGuids.includes(achievement.id),
      } as SummitAchievementData;
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = $("#awardsTable").DataTable({
    destroy: true,
    data: awardedAchievements,
    pageLength: 5000,
    order: [
      [2, "asc"],
      [3, "asc"],
    ],
    columns: [
      { title: "ID", data: "id", visible: false },
      { title: "MemberID", data: "memberid", visible: false },
      { title: "Member", data: "member", visible: false },
      { title: "Type", data: "type" },
      { title: "Achievement", data: "achievementName" },
      { title: "Date Awarded", data: "dateAwarded" },
      {
        title: "Presented",
        data: "presented",
        render: function (data) {
          return data ? "Yes" : "No";
        },
      },
      { title: "Present", data: null },
    ],
    columnDefs: [
      {
        orderable: false,
        targets: 7,
        data: null,
        defaultContent:
          '<button class="present mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--small summit-btn" style="min-width: 0;margin: 0px !important;padding: 0px 8px;font-size: 0.6rem;height: 30px !important;">Present</button>',
      },
    ],
    dom: "rt",
    buttons: ["excel", "pdf"],
    searching: true,
    rowGroup: {
      dataSrc: "member",
      startRender: function (rows, group) {
        return $('<tr id="' + group + '"/>').append(
          '<td colspan="8"><b>' +
            group +
            '</b><button class="presentall mr-4 v-btn v-btn--outlined theme--light v-size--small summit-menu-outline" style="min-width: 0;margin: 0px !important;padding: 0px 8px;font-size: 0.6rem;height: 30px !important; margin-left: 75px !important;">Present All</button></td>',
        );
      },
    },
  });
  table.columns(6).search("^No$", true, false).draw();
  $("#buttons").append('<button id="hidePresented" class="mr-4 v-btn v-btn--is-elevated v-btn--has-bg theme--light v-size--default summit-btn">Show Presented</button>');
  $("#hidePresented").on("click", function () {
    if ($("#hidePresented").text() === "Hide Presented") {
      $("#hidePresented").text("Show Presented");
      table.columns(6).search("No").draw();
    } else {
      $("#hidePresented").text("Hide Presented");
      table.columns(6).search("").draw();
    }
  });

  $(".savebtn").show();

  $("#awardsTable tbody").on("click", "button.present", function () {
    const data = table.row($(this).parents("tr")).data() as SummitAchievementData;
    data.presented = !data.presented;
    table.row($(this).parents("tr")).invalidate().draw();
  });

  $("#awardsTable").on("click", "button.presentall", function () {
    const group = $(this).closest("tr").attr("id");
    const rows = table.rows().nodes();
    $(rows).each(function (index, element) {
      const row = table.row(element);
      const data = row.data() as SummitAchievementData;
      if (data && data.member === group) {
        data.presented = true;
        row.invalidate().draw();
      }
    });
  });

  $(".savebtn").on("click", function () {
    let presentedIds = [] as { memberid: string; membername: string; awards: string[] }[];
    const rows = table.rows().nodes();
    $(rows).each(function (index, element) {
      const row = table.row(element);
      const data = row.data() as SummitAchievementData;
      if (data && data.presented) {
        const member = presentedIds.find((member) => member.memberid === data.memberid);
        if (member) {
          member.awards.push(data.id);
        } else {
          presentedIds.push({ memberid: data.memberid, membername: data.member, awards: [data.id] });
        }
      }
    });

    presentedIds = presentedIds.map((idArray) => {
      return { memberid: idArray.memberid, membername: idArray.membername, awards: processGuids(idArray.awards) };
    });
    const eventToUpload = {
      schedule_items: presentedIds
        .flatMap((idArray) => {
          return idArray.awards.map((award) => {
            return { memberid: idArray.memberid, membername: idArray.membername, awards: award };
          });
        })
        .map((idArray) => {
          return {
            start_datetime: moment().format(),
            end_datetime: moment().format(),
            description: idArray.awards,
            leader_notes: idArray.memberid,
            assistant_notes: idArray.membername,
          } as TerrainEventScheduleItem;
        }),
      title: "Summit Award Storage - Please Ignore",
      achievement_pathway_logbook_data: {
        achievement_meta: {
          stream: "",
          branch: "",
        },
      },
      achievement_pathway_oas_data: {
        award_rule: "individual",
        verifier: {
          name: "Not Applicable",
          contact: "",
          type: "member",
        },
        groups: [],
      },
      attendance: {
        leader_member_ids: [],
        assistant_member_ids: [],
        attendee_member_ids: [],
        participant_member_ids: [],
      },
      challenge_area: "creative",
      description: "This is for keeping track of badges that have been presented, please do not modify this event or delete it.",
      end_datetime: "2100-01-10T03:00:00.000+00:00",
      equipment_notes: "",
      event_type: { type: "unit", id: context.currentProfile?.profiles[0].unit.id },
      type: "unit",
      iana_timezone: "Australia/Brisbane",
      justification: "",
      location: "Summit Award Storage ",
      organisers: ["ceec946a-6197-3cb0-acf9-5d8ab519c59d"],
      review: { general_tags: [], scout_method_elements: ["symbolic_framework"], scout_spices_elements: [] },
      start_datetime: "2100-01-10T02:00:00.000+00:00",
      status: "planned",
      uploads: [],
    } as TerrainEvent;
    if (existingEvent && existingEvent.id) {
      updateEvent(existingEvent.id, JSON.stringify(eventToUpload));
    } else {
      createNewEvent(JSON.stringify(eventToUpload));
    }
  });
}
