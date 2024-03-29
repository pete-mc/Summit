import React from "react";
import { Root, createRoot } from "react-dom/client";
import { TerrainEvent, TerrainEventScheduleItem, TerrainUnitMember, TerrrainPostEvent } from "@/types/terrainTypes";
import { fetchMemberEvents, fetchUnitAchievementsFilterd, fetchActivity, updateEvent, createNewEvent, fetchUnitMembers } from "@/services";
import { TerrainRootState } from "@/types/terrainState";
import { defineComponent } from "vue";
import { TerrainState, processGuids, reconstructGuids } from "@/helpers";
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
      const existingGuids = reconstructGuids(existingAwards);
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

    handleUpdate(newItems: SummitAchievement[]) {
      let presentedIds = [] as { memberid: string; membername: string; awards: string[] }[];
      newItems.forEach((item) => {
        const existing = presentedIds.find((i) => i.memberid === item.memberid);
        if (existing) {
          existing.awards.push(item.id);
        } else {
          presentedIds.push({ memberid: item.memberid, membername: item.member, awards: [item.id] });
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

      this.items.forEach((item) => {
        if (newItems.find((i) => i.id === item.id)) {
          item.presented = "Yes";
        }
      });
      this.renderReactComponent(this.items);
    },
  },
});
