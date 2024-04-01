import fetchNSWTermData from "./school_terms/fetchNSWTermData";
import { State } from "@/types/terrainState";
export default function fetchSchoolTermDates(state: State) {
  switch (state) {
    default:
      return fetchNSWTermData();
  }
}
