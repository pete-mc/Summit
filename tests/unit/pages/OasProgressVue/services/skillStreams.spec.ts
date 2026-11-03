import { listSkillStreams, skillStreamKey, skillStreamLabel } from "@/pages/OasProgressVue/services/skillStreams";

const row = (stream: string, branch: string) => ({ stream, branch });

describe("skillStreams", () => {
  it("labels the trunk with the skill alone and a stream as Skill - Stream", () => {
    expect(skillStreamLabel(row("camping", "camping"))).toBe("Camping");
    expect(skillStreamLabel(row("camping", "lightweight-camping"))).toBe("Camping - Lightweight Camping");
  });

  it("lists each Skill - Stream once, in OAS skill order, trunk first, then by label", () => {
    const items = [row("camping", "lightweight-camping"), row("bushcraft", "pioneering"), row("camping", "camping"), row("bushcraft", "bushcraft"), row("camping", "camping")];

    expect(listSkillStreams(items).map((s) => s.key)).toEqual([skillStreamKey("bushcraft", "bushcraft"), skillStreamKey("bushcraft", "pioneering"), skillStreamKey("camping", "camping"), skillStreamKey("camping", "lightweight-camping")]);
  });
});
