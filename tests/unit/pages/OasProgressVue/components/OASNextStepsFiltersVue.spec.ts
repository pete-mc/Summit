import * as fs from "fs";
import * as path from "path";
import OASNextStepsFiltersVue from "@/pages/OasProgressVue/components/OASNextStepsFiltersVue";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

describe("OASNextStepsFiltersVue", () => {
  it("has one single-choice picker each for Member, Skill and Stage, plus Reset filters", () => {
    const source = fs.readFileSync(path.resolve(REPO_ROOT, "src/pages/OasProgressVue/components/OASNextStepsFiltersVue.vue"), "utf8");
    expect(source).toContain('label="Member"');
    expect(source).toContain('label="Skill"');
    expect(source).toContain('label="Stage"');
    expect(source).not.toContain("multiple");
    expect(source).not.toContain("clearable");
    expect(source).toContain("$emit('reset')");
  });

  it("never emits an empty member", () => {
    const onMemberChange = (OASNextStepsFiltersVue as unknown as { methods: { onMemberChange(this: unknown, id: string | null): void } }).methods.onMemberChange;
    const emit = jest.fn();
    onMemberChange.call({ $emit: emit }, null);
    onMemberChange.call({ $emit: emit }, "");
    expect(emit).not.toHaveBeenCalled();
    onMemberChange.call({ $emit: emit }, "m2");
    expect(emit).toHaveBeenCalledWith("update:memberId", "m2");
  });
});
