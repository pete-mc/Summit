import { TerrainAchievements, TerrainAchievementsStream } from "@/types/terrainTypes";
import { UnitMember } from "@/types/terrainState";

export interface OasReportSubItem {
  template: string;
  stream: string;
  branch: string;
  stage: number;
}

type OasReportSubItems = {
  [K in 'bushwalking' | 'bushcraft' | 'camping' | 'alpine' | 'cycling' | 'vertical' | 'aquatics' | 'boating' | 'paddling']?: OasReportSubItem[];
};

export default class OasReportItem implements OasReportSubItems {
  [key: string]: any;
  name: string;
  bushwalking?: OasReportSubItem[];
  bushcraft?: OasReportSubItem[];
  camping?: OasReportSubItem[];
  alpine?: OasReportSubItem[];
  cycling?: OasReportSubItem[];
  vertical?: OasReportSubItem[];
  aquatics?: OasReportSubItem[];
  boating?: OasReportSubItem[];
  paddling?: OasReportSubItem[];

  constructor(memberOAS: TerrainAchievements[], UnitMember: UnitMember) {
    this.name = UnitMember.first_name + " " + UnitMember.last_name;
    ["bushwalking", "bushcraft", "camping", "alpine", "cycling", "vertical", "aquatics", "boating", "paddling"].forEach((stream) => {
      this[stream] = [] as OasReportSubItem[];
      memberOAS.forEach((achievement) => {
        if (achievement.achievement_meta && achievement.achievement_meta.stream === stream && this[stream] != null) {
          const branchStage = (this[stream] as OasReportSubItem[]).find((reportItem) => reportItem.branch === achievement.achievement_meta?.branch);
          if (!branchStage) {
            (this[stream] as OasReportSubItem[]).push({ template: achievement.template ?? "", stream: stream, branch: achievement.achievement_meta.branch ?? "", stage: achievement.achievement_meta.stage ?? 0 });
          } else if (branchStage.stage < (achievement.achievement_meta.stage ?? 0)) {
            branchStage.stage = achievement.achievement_meta.stage ?? 0;
          }
        }
      });
      if ((this[stream] as OasReportSubItem[]).length > 1) {
        const itemsToRemove: OasReportSubItem[] = [];

        (this[stream] as OasReportSubItem[]).forEach((reportItem) => {
          (this[stream] as OasReportSubItem[]).forEach((otherReportItem) => {
            const reportItemTemplatePrefix = reportItem.template.slice(0, -2);
            const otherReportItemTemplatePrefix = otherReportItem.template.slice(0, -2);
        
            if (otherReportItemTemplatePrefix.startsWith(reportItemTemplatePrefix) && otherReportItemTemplatePrefix !== reportItemTemplatePrefix) {
              itemsToRemove.push(reportItem);
            }
          });
        });

        itemsToRemove.forEach((itemToRemove) => {
          const index = (this[stream] as OasReportSubItem[]).indexOf(itemToRemove);
          if (index !== -1) {
            (this[stream] as OasReportSubItem[]).splice(index, 1);
          }
        });
      }
    });
  }
}
