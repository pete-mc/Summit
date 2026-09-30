/**
 * Every badge Terrain is known to award, and the artwork Summit has for it.
 *
 * ## Why this file exists
 *
 * Badge lookup used to be two hardcoded maps that duplicated each other, keyed by strings guessed
 * from artwork filenames. On 2026-09-30 that produced a silent failure: the camper awards were
 * keyed "camping_N" when Terrain actually sends "camper_award_N", so five badges rendered blank
 * placeholders with no error anywhere. Nothing recorded that the other 24 additional awards even
 * existed.
 *
 * So: one table, keys taken from Terrain's own data, and a row for every badge — including the
 * ones with no artwork yet, so a gap is visible here rather than discovered on the page.
 *
 * ## Source of truth
 *
 * Terrain's shipped bundle, captured at docs/terrain.scouts.com.au/_nuxt/app.*.js, which contains
 * a literal asset map naming every badge SVG Terrain ships. tests/unit/shared/badgeManifest.spec.ts
 * re-reads that bundle and fails if this file drifts from it.
 *
 * Note the bundle is a captured SNAPSHOT. It cannot tell us about an award Terrain added after the
 * capture. Re-capture to pick those up; the test guards drift within the repo, not upstream change.
 *
 * ## Adding artwork
 *
 * Drop the file into src/images/<folder>/ and replace that row's `file: null` with its path
 * relative to images/. No other change needed — manifest.json exposes both image directories.
 */

export interface BadgeEntry {
  /**
   * Artwork path relative to images/, e.g. "aawards/aawards-walkabout10.svg".
   * null means Terrain awards this badge but Summit has no artwork for it yet — callers render a
   * neutral placeholder rather than a broken image.
   */
  file: string | null;
  /** Human-readable name, used for tooltips and to make an unfilled row legible here. */
  label: string;
  /**
   * True for wide artwork (the additional awards are 96x66) as opposed to the square 85x85 OAS
   * icons. A caller sizing a fixed square box must give these extra width or they letterbox down
   * to a visibly smaller badge than their neighbours.
   */
  wide?: boolean;
}

/**
 * The nine OAS skills. Keyed by Terrain's `achievement_meta.branch`, lower-cased with hyphens
 * normalised to underscores — see SummitAchievement.getBadgeKey().
 */
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

/**
 * All 32 additional awards Terrain ships artwork for, keyed by `achievement_meta.additional_award_id`.
 *
 * Verified against the bundle's "./additional-award-badges/<id>.svg" asset map — these keys are
 * NOT inferred from Summit's own filenames, which is exactly the mistake that broke the camper
 * awards. Note the artwork files are named after the key, so camper awards are camperaward*.svg.
 *
 * 16 of 32 have artwork. The rest are placeholders awaiting files.
 */
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

/**
 * 15 milestone badges: Terrain ships distinct artwork per section per stage
 * ("./milestones/<section>/milestone-<1|2|3>.svg"), so a Cub's Milestone 1 is not a Scout's.
 * Keyed milestone_<section>_<stage>.
 *
 * Listed one row per badge rather than generated from a section × stage loop. A loop cannot hold
 * a per-row filename, which is the whole point of the table — the Venturer rows below have
 * artwork and the other twelve do not.
 *
 * 3 of 15 have artwork.
 */
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

/**
 * 5 peak awards, one per section ("./icons/icon-peak-award-<section>-active.svg").
 * Keyed peak_award_<section>. None have artwork yet.
 */
const PEAK_AWARDS: Record<string, BadgeEntry> = {
  peak_award_joey: { file: null, label: "Peak Award (Joey)" },
  peak_award_cub: { file: null, label: "Peak Award (Cub)" },
  peak_award_scout: { file: null, label: "Peak Award (Scout)" },
  peak_award_venturer: { file: null, label: "Peak Award (Venturer)" },
  peak_award_rover: { file: null, label: "Peak Award (Rover)" },
};

/**
 * The six Special Interest Areas, keyed by Terrain's own SIA id (see src/shared/siaTypes.ts, which
 * holds the same ids and is the source for the display titles). None have artwork yet.
 */
const SIAS: Record<string, BadgeEntry> = {
  sia_adventure_sport: { file: null, label: "Adventure & Sport" },
  sia_art_literature: { file: null, label: "Art & Literature" },
  sia_better_world: { file: null, label: "Creating a Better World" },
  sia_environment: { file: null, label: "Environment" },
  sia_growth_development: { file: null, label: "Growth & Development" },
  sia_stem_innovation: { file: null, label: "STEM & Innovation" },
};

/**
 * Remaining achievement types from TerrainAchievementsType that are not covered above and are not
 * section- or id-specific. These are the fallback keys getBadgeKey() produces from the bare type.
 * None have artwork yet.
 */
const OTHER_TYPES: Record<string, BadgeEntry> = {
  adventurous_journey: { file: null, label: "Adventurous Journey" },
  course_reflection: { file: null, label: "LS/PD Course" },
  intro_scouting: { file: null, label: "Introduction to Scouting" },
  intro_section: { file: null, label: "Introduction to Section" },
  personal_reflection: { file: null, label: "Personal Reflection" },
};

/**
 * Every badge Summit knows about, keyed by the badgeKey SummitAchievement.getBadgeKey() produces.
 *
 * A key absent from here, or present with file: null, resolves to no artwork and the caller shows
 * a neutral placeholder — never a broken image.
 */
export const BADGE_MANIFEST: Record<string, BadgeEntry> = {
  ...OAS_SKILLS,
  ...ADDITIONAL_AWARDS,
  ...MILESTONES,
  ...PEAK_AWARDS,
  ...SIAS,
  ...OTHER_TYPES,
};

/** The additional-award keys specifically — used by the test that checks them against Terrain's bundle. */
export const ADDITIONAL_AWARD_KEYS = Object.keys(ADDITIONAL_AWARDS);

/** The OAS skill keys specifically, so the OAS-only resolver does not offer non-OAS badges. */
export const OAS_SKILL_KEYS = Object.keys(OAS_SKILLS);

/**
 * Collapses punctuation variants ("walkabout-100", "Walkabout 100") onto the underscore form the
 * manifest is keyed by, so a hyphen or capitalisation difference does not silently fall through to
 * the placeholder.
 */
export function normaliseBadgeKey(badgeKey: string): string {
  return badgeKey.toLowerCase().replace(/[\s-]+/g, "_");
}

/** The manifest entry for a badge key, or null when Summit does not know this badge at all. */
export function getBadgeEntry(badgeKey: string): BadgeEntry | null {
  if (!badgeKey) return null;
  return BADGE_MANIFEST[normaliseBadgeKey(badgeKey)] ?? null;
}
