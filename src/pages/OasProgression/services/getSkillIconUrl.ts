import { normaliseBadgeKey, OAS_SKILL_KEYS } from "@/shared/badgeManifest";
import { getBadgeIconUrl } from "@/pages/PresentAwardsVue/services/getBadgeIconUrl";

/** OAS skills only, so an OAS caller can't render an unrelated badge. Null for an unknown skill. */
export function getSkillIconUrl(skill: string): string | null {
  const key = normaliseBadgeKey(skill);
  return OAS_SKILL_KEYS.includes(key) ? getBadgeIconUrl(key) : null;
}
