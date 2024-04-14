import React from "react";
import { Root, createRoot } from "react-dom/client";
import { TerrainEvent, TerrainEventScheduleItem, TerrainUnitMember, TerrrainPostEvent } from "@/types/terrainTypes";
import { fetchMemberEvents, fetchUnitAchievementsFilterd, fetchActivity, updateEvent, createNewEvent, fetchUnitMembers } from "@/services";
import { TerrainRootState } from "@/types/terrainState";
import { defineComponent } from "vue";
import { TerrainState, processGuidsAndDates, reconstructGuids, reconstructGuidsAndDates } from "@/helpers";
import AwardsTable from "./components/PresentAwards";
import SummitAchievement from "./models/SummitAchievement";
import { TerrainAchievementsType } from "@/shared";
import moment from "moment";

function data() {
  return {
    items: [] as SummitAchievement[],
    root: undefined as Root | undefined,
    storeEvent: undefined as TerrainEvent | undefined,
  };
}

export default defineComponent({
  name: "PresentAwards",
  data,
  watch: {
    items(newItems: SummitAchievement[]) {
      this.renderReactComponent(newItems);
    },
  },
  mounted() {
    this.getAwardData();
    this.mountReactComponent();
    (window.$nuxt.$store.state as TerrainRootState).global.breadcrumbs = [
      {
        text: "Summit",
        disabled: false,
        to: "/summit/home",
        exact: true,
      },
      {
        text: "Tools",
        disabled: true,
        to: "/summit/tools",
        exact: true,
      },
      {
        text: "Present Awards",
        disabled: true,
        to: "/summit/tools/presentawards",
        exact: true,
      },
    ];
  },
  beforeDestroy() {
    this.unmountReactComponent();
  },
  methods: {
    async getAwardData() {
      this.storeEvent = await fetchActivity(
        (await fetchMemberEvents("2100-01-01T00:00:00", "2100-01-30T00:00:00")).find((event) => event.title === "Summit Award Storage - Please Ignore" && event.invitee_id === TerrainState.getUnitID())?.id,
      );

      const fetchPromises = Object.values(TerrainAchievementsType).map((type) => fetchUnitAchievementsFilterd(`type=${type}`));
      const membersMap = (await fetchUnitMembers()).reduce(
        (map, member) => {
          map[member.id] = member;
          return map;
        },
        {} as { [id: string]: TerrainUnitMember },
      );
      const existingAwards = this.storeEvent && this.storeEvent.schedule_items ? this.storeEvent.schedule_items.flatMap((item) => item.description) : [];
      const existingGuids =
        this.storeEvent?.equipment_notes === "2" //check version of event data (version 1 only has guids and no dates, version 2 has guids and dates)
          ? reconstructGuidsAndDates(existingAwards)
          : reconstructGuids(existingAwards).map((guid) => ({ guid, date: null }));
      this.items = (await Promise.all(fetchPromises)).flat().reduce((result, item) => {
        if (item.status === "awarded") {
          result.push(new SummitAchievement(item, membersMap[item.member_id], existingGuids));
        }
        return result;
      }, [] as SummitAchievement[]);
      console.timeStamp(" Got all items");
      this.renderReactComponent(this.items as SummitAchievement[]);
    },
    mountReactComponent() {
      this.root = createRoot(this.$refs.reactRoot as HTMLElement);
      this.renderReactComponent(this.items as SummitAchievement[]);
    },
    renderReactComponent(items: SummitAchievement[]) {
      const reactElement = React.createElement(AwardsTable, {
        items,
        onUpdate: this.handleUpdate,
      });
      this.root?.render(reactElement);
    },
    unmountReactComponent() {
      if (this.root) this.root.unmount();
      this.root = undefined;
    },

    //update process from react component when save button is clicked
    handleUpdate(newItems: SummitAchievement[]) {
      console.log("Updating items", newItems);
      //get a list of member ids and the awards they have been presented
      const presentedRecordsByMember = [] as { memberid: string; membername: string; awards: { guid: string; date: Date }[] }[];
      newItems.forEach((item) => {
        const existing = presentedRecordsByMember.find((i) => i.memberid === item.memberid);
        if (existing) {
          existing.awards.push({ guid: item.id, date: moment(item.presented, "DD/MM/YYYY").toDate() });
        } else {
          presentedRecordsByMember.push({ memberid: item.memberid, membername: item.member, awards: [{ guid: item.id, date: moment(item.presented, "DD/MM/YYYY").toDate() }] });
        }
      });

      //compress the award guids to base 300
      const compressedRecordsByMember = presentedRecordsByMember.map((idArray) => {
        return { memberid: idArray.memberid, membername: idArray.membername, awards: processGuidsAndDates(idArray.awards) };
      });

      //unbatch the awards and create one schedule item per member or more for members who exeed the award batch limit
      const scheduleItems = [] as TerrainEventScheduleItem[];
      compressedRecordsByMember.forEach((idArray) => {
        idArray.awards.forEach((award) => {
          scheduleItems.push({
            start_datetime: moment().format(),
            end_datetime: moment().format(),
            description: award,
            leader_notes: idArray.memberid,
            assistant_notes: idArray.membername,
          });
        });
      });

      console.log("Schedule Items", scheduleItems);
      //create the event object
      const eventToUpload = {
        schedule_items: scheduleItems,
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
        equipment_notes: "2",
        event_type: { type: "unit", id: TerrainState.getUnitID() },
        type: "unit",
        iana_timezone: "Australia/Brisbane",
        justification: "",
        location: "Summit Award Storage ",
        organisers: [TerrainState.getMemberID()],
        review: { general_tags: [], scout_method_elements: ["symbolic_framework"], scout_spices_elements: [] },
        start_datetime: "2100-01-10T02:00:00.000+00:00",
        status: "planned",
        uploads: [],
      } as TerrrainPostEvent;
      if (this.storeEvent?.id) {
        updateEvent(this.storeEvent.id, JSON.stringify(eventToUpload));
      } else {
        createNewEvent(JSON.stringify(eventToUpload));
      }

      // this.items.forEach((item) => {
      //   const newItem = newItems.find((i) => i.id === item.id);
      //   if (newItem) {
      //     item.presented = newItem.presented;
      //   }
      // });
      this.renderReactComponent(this.items);
    },
  },
});
