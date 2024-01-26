import { TerrainAchievements, TerrainAchievementsStream } from "../types/terrainTypes";
import { UnitMember } from "../types/terrainState";

export interface OasReportSubItem {
  stream: string;
  stage: number;
}

type OasReportSubItems = {
  [K in 'bushwalking' | 'bushcraft' | 'camping' | 'alpine' | 'cycling' | 'vertical' | 'aquatics' | 'boating' | 'paddling']?: OasReportSubItem[];
};

export class OasReportItem implements OasReportSubItems {
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
    ["bushwalking", "bushcraft", "camping", "alpine", "cycling", "vertical", "aquatics", "boating", "paddling"].forEach((branch) => {
      this[branch] = [] as OasReportSubItem[];
      memberOAS.forEach((achievement) => {
        if (achievement.achievement_meta?.branch === branch) {
          const streamStage = this[branch].find((stream: { stream: TerrainAchievementsStream | undefined; }) => stream.stream === achievement.achievement_meta?.stream);
          if (!streamStage) {
            this[branch].push({ stream: achievement.achievement_meta.stream, stage: achievement.achievement_meta.stage });
          } else if (streamStage.stage < (achievement.achievement_meta.stage ?? 0)) {
            streamStage.stage = achievement.achievement_meta.stage;
          }
        }
      });
    });
  }
}
