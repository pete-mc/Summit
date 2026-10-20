/**
 * Every badge Terrain awards, with Summit's artwork (or null).
 * Learning: keys come from Terrain's bundle (docs/terrain.scouts.com.au/_nuxt/app.*.js), never from artwork
 * filenames. Guessing them once left five camper awards silently blank ("camping_N" vs "camper_award_N").
 * badgeManifest.spec.ts checks this file against that captured bundle; re-capture to find new awards.
 * To add artwork: put the file in src/images/<folder>/ and set that row's `file`.
 */

export interface BadgeEntry {
  /** Relative to images/. null = no artwork yet; callers show a placeholder. */
  file: string | null;
  label: string;
  /** 96x66 additional-award art rather than an 85x85 square. */
  wide?: boolean;
}

const OAS_SKILLS: Record<string, BadgeEntry> = {
  alpine: { file: "oas-skills/oas-alpine.svg", label: "Alpine" },
  aquatics: { file: "oas-skills/oas-aquatics.svg", label: "Aquatics" },
  boating: { file: "oas-skills/oas-boating.svg", label: "Boating" },
  bushcraft: { file: "oas-skills/oas-bushcraft.svg", label: "Bushcraft" },
  bushwalking: { file: "oas-skills/oas-bushwalking.svg", label: "Bushwalking" },
  camping: { file: "oas-skills/oas-camping.svg", label: "Camping" },
  cycling: { file: "oas-skills/oas-cycling.svg", label: "Cycling" },
  paddling: { file: "oas-skills/oas-paddling.svg", label: "Paddling" },
  vertical: { file: "oas-skills/oas-vertical.svg", label: "Vertical" },
};

/** Keyed by additional_award_id, verified against the bundle. Files are named after the key (camperaward*.svg). */
const ADDITIONAL_AWARDS: Record<string, BadgeEntry> = {
  camper_award_10: { file: "aawards/aawards-camperaward-10.svg", label: "Camper Award 10", wide: true },
  camper_award_25: { file: "aawards/aawards-camperaward-25.svg", label: "Camper Award 25", wide: true },
  camper_award_50: { file: "aawards/aawards-camperaward-50.svg", label: "Camper Award 50", wide: true },
  camper_award_75: { file: "aawards/aawards-camperaward-75.svg", label: "Camper Award 75", wide: true },
  camper_award_100: { file: "aawards/aawards-camperaward-100.svg", label: "Camper Award 100", wide: true },
  walkabout_10: { file: "aawards/aawards-walkabout-10.svg", label: "Walkabout 10", wide: true },
  walkabout_50: { file: "aawards/aawards-walkabout-50.svg", label: "Walkabout 50", wide: true },
  walkabout_100: { file: "aawards/aawards-walkabout-100.svg", label: "Walkabout 100", wide: true },
  walkabout_150: { file: "aawards/aawards-walkabout-150.svg", label: "Walkabout 150", wide: true },
  walkabout_200: { file: "aawards/aawards-walkabout-200.svg", label: "Walkabout 200", wide: true },
  walkabout_300: { file: "aawards/aawards-walkabout-300.svg", label: "Walkabout 300", wide: true },
  walkabout_400: { file: "aawards/aawards-walkabout-400.svg", label: "Walkabout 400", wide: true },
  walkabout_500: { file: "aawards/aawards-walkabout-500.svg", label: "Walkabout 500", wide: true },
  champions_for_nature: { file: null, label: "Champions for Nature", wide: true },
  duke_of_edinburgh_bronze: { file: null, label: "Duke of Edinburgh Bronze", wide: true },
  duke_of_edinburgh_silver: { file: null, label: "Duke of Edinburgh Silver", wide: true },
  duke_of_edinburgh_gold: { file: null, label: "Duke of Edinburgh Gold", wide: true },
  first_aid: { file: "aawards/aawards-firstaid.svg", label: "First Aid", wide: true },
  international_ambassador: { file: null, label: "International Ambassador", wide: true },
  landcare: { file: null, label: "Landcare", wide: true },
  language_emblem: { file: null, label: "Language Emblem", wide: true },
  mental_health: { file: null, label: "Mental Health", wide: true },
  messengers_of_peace: { file: null, label: "Messengers of Peace", wide: true },
  scout_wings: { file: null, label: "Scout Wings", wide: true },
  scouts_for_sdgs: { file: null, label: "Scouts for SDGs", wide: true },
  scouts_go_solar: { file: null, label: "Scouts Go Solar", wide: true },
  scouts_of_the_world: { file: null, label: "Scouts of the World", wide: true },
  ses: { file: "aawards/aawards-ses.svg", label: "SES", wide: true },
  their_service_our_heritage: { file: "aawards/aawards-serviceheritage.svg", label: "Their Service Our Heritage", wide: true },
  tide_turners_plastic: { file: null, label: "Tide Turners Plastic", wide: true },
  world_scout_environment_badge: { file: null, label: "World Scout Environment Badge", wide: true },
  youth_helper: { file: null, label: "Youth Helper", wide: true },
};

/** Distinct artwork per section and stage. One row each, not a loop, so each row can have its own file. */
const MILESTONES: Record<string, BadgeEntry> = {
  milestone_joey_1: { file: null, label: "Milestone 1 (Joey)" },
  milestone_joey_2: { file: null, label: "Milestone 2 (Joey)" },
  milestone_joey_3: { file: null, label: "Milestone 3 (Joey)" },
  milestone_cub_1: { file: null, label: "Milestone 1 (Cub)" },
  milestone_cub_2: { file: null, label: "Milestone 2 (Cub)" },
  milestone_cub_3: { file: null, label: "Milestone 3 (Cub)" },
  milestone_scout_1: { file: null, label: "Milestone 1 (Scout)" },
  milestone_scout_2: { file: null, label: "Milestone 2 (Scout)" },
  milestone_scout_3: { file: null, label: "Milestone 3 (Scout)" },
  milestone_venturer_1: { file: "milestones/venturer_milestone_1.svg", label: "Milestone 1 (Venturer)" },
  milestone_venturer_2: { file: "milestones/venturer_milestone_2.svg", label: "Milestone 2 (Venturer)" },
  milestone_venturer_3: { file: "milestones/venturer_milestone_3.svg", label: "Milestone 3 (Venturer)" },
  milestone_rover_1: { file: null, label: "Milestone 1 (Rover)" },
  milestone_rover_2: { file: null, label: "Milestone 2 (Rover)" },
  milestone_rover_3: { file: null, label: "Milestone 3 (Rover)" },
};

const PEAK_AWARDS: Record<string, BadgeEntry> = {
  peak_award_joey: { file: null, label: "Peak Award (Joey)" },
  peak_award_cub: { file: null, label: "Peak Award (Cub)" },
  peak_award_scout: { file: null, label: "Peak Award (Scout)" },
  peak_award_venturer: { file: null, label: "Peak Award (Venturer)" },
  peak_award_rover: { file: null, label: "Peak Award (Rover)" },
};

/** Keyed by Terrain's SIA id (same ids as siaTypes.ts). */
const SIAS: Record<string, BadgeEntry> = {
  sia_adventure_sport: { file: null, label: "Adventure & Sport" },
  sia_art_literature: { file: null, label: "Art & Literature" },
  sia_better_world: { file: null, label: "Creating a Better World" },
  sia_environment: { file: null, label: "Environment" },
  sia_growth_development: { file: null, label: "Growth & Development" },
  sia_stem_innovation: { file: null, label: "STEM & Innovation" },
};

/** Fallback keys getBadgeKey() produces from the bare type. */
const OTHER_TYPES: Record<string, BadgeEntry> = {
  adventurous_journey: { file: null, label: "Adventurous Journey" },
  course_reflection: { file: null, label: "LS/PD Course" },
  intro_scouting: { file: null, label: "Introduction to Scouting" },
  intro_section: { file: null, label: "Introduction to Section" },
  personal_reflection: { file: null, label: "Personal Reflection" },
};

export const BADGE_MANIFEST: Record<string, BadgeEntry> = {
  ...OAS_SKILLS,
  ...ADDITIONAL_AWARDS,
  ...MILESTONES,
  ...PEAK_AWARDS,
  ...SIAS,
  ...OTHER_TYPES,
};

export const ADDITIONAL_AWARD_KEYS = Object.keys(ADDITIONAL_AWARDS);

export const OAS_SKILL_KEYS = Object.keys(OAS_SKILLS);

/** A hyphen or case difference must not silently fall through to the placeholder. */
export function normaliseBadgeKey(badgeKey: string): string {
  return badgeKey.toLowerCase().replace(/[\s-]+/g, "_");
}

export function getBadgeEntry(badgeKey: string): BadgeEntry | null {
  if (!badgeKey) return null;
  return BADGE_MANIFEST[normaliseBadgeKey(badgeKey)] ?? null;
}
