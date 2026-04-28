import moment from "moment";
import { TerrainEvent, TerrainUnitMember } from "@/types/terrainTypes";

export interface GroupedMultiSelectOption {
  value: string;
  label: string;
}

export interface GroupedMultiSelectGroup {
  label: string;
  options: GroupedMultiSelectOption[];
}

export interface SummitCalendarValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface SummitCalendarConflictCandidate {
  Id?: string;
  Subject?: string;
  StartTime?: Date | string;
  EndTime?: Date | string;
}

interface MemberIdentity {
  id: string;
  first_name: string;
  last_name: string;
}

const toMemberIdentity = (member: TerrainUnitMember): MemberIdentity => ({
  id: member.id,
  first_name: member.first_name,
  last_name: member.last_name,
});

const mapSelectedMemberIds = (selectedValues: string[], members: TerrainUnitMember[]): MemberIdentity[] => {
  if (!selectedValues.length) {
    return [];
  }

  return members.filter((member) => selectedValues.includes(member.id)).map(toMemberIdentity);
};

const unique = (items: string[]): string[] => Array.from(new Set(items));

export const buildGroupedMemberOptions = (members: TerrainUnitMember[]): GroupedMultiSelectGroup[] => {
  const grouped = new Map<string, GroupedMultiSelectOption[]>();

  members.forEach((member) => {
    const memberLabel = `${member.first_name} ${member.last_name}`.trim();
    if (!member.groups?.length) {
      const existing = grouped.get("Other") ?? [];
      existing.push({ value: member.id, label: memberLabel });
      grouped.set("Other", existing);
      return;
    }

    member.groups.forEach((group) => {
      const groupName = group.name || "Other";
      const existing = grouped.get(groupName) ?? [];
      existing.push({ value: member.id, label: memberLabel });
      grouped.set(groupName, existing);
    });
  });

  return Array.from(grouped.entries()).map(([label, options]) => ({
    label,
    options: unique(options.map((option) => option.value)).map((value) => options.find((option) => option.value === value) as GroupedMultiSelectOption),
  }));
};

export const applyGroupedMultiSelectChange = <T extends Partial<TerrainEvent>>(activity: T, fieldId: string, selectedValues: string[], members: TerrainUnitMember[]): T => {
  const selectedMembers = mapSelectedMemberIds(selectedValues, members);

  switch (fieldId) {
    case "organisers":
      return {
        ...activity,
        organisers: selectedMembers,
      };
    case "leader_members":
      return {
        ...activity,
        attendance: {
          ...(activity.attendance ?? {}),
          leader_members: selectedMembers,
        },
      };
    case "assistant_members":
      return {
        ...activity,
        attendance: {
          ...(activity.attendance ?? {}),
          assistant_members: selectedMembers,
        },
      };
    case "scout_method_elements":
      return {
        ...activity,
        review: {
          ...(activity.review ?? {}),
          scout_method_elements: selectedValues,
        },
      };
    default:
      return {
        ...activity,
        [fieldId]: selectedValues,
      };
  }
};

export const validateSummitCalendarActivity = (activity: Partial<TerrainEvent> | undefined): SummitCalendarValidationResult => {
  const errors: Record<string, string> = {};

  if (!activity?.title?.trim()) {
    errors.title = "Title is required";
  }

  if (!activity?.location?.trim()) {
    errors.location = "Location is required";
  }

  if (!activity?.challenge_area?.trim()) {
    errors.challenge_area = "Challenge Area is required";
  }

  if (!activity?.review?.scout_method_elements?.length) {
    errors.scout_method_elements = "Scout Method is required";
  }

  if (!activity?.organisers?.length) {
    errors.organisers = "At least one organiser is required";
  }

  if (!activity?.start_datetime || !activity?.end_datetime || moment(activity.start_datetime).isSameOrAfter(activity.end_datetime)) {
    errors.date_range = "Start date can't be after end date";
  }

  const leaderIds = activity?.attendance?.leader_members?.map((member) => member.id) ?? [];
  const assistantIds = activity?.attendance?.assistant_members?.map((member) => member.id) ?? [];
  const hasRoleOverlap = leaderIds.some((leaderId) => assistantIds.includes(leaderId));

  if (hasRoleOverlap) {
    errors.member_roles = "A member can't both be a leader and an assistant at the same time";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const detectSummitCalendarSoftConflicts = (activity: Partial<TerrainEvent> | undefined, items: SummitCalendarConflictCandidate[]): string[] => {
  if (!activity?.start_datetime || !activity?.end_datetime || !items.length) {
    return [];
  }

  const activityStart = moment(activity.start_datetime);
  const activityEnd = moment(activity.end_datetime);

  if (!activityStart.isValid() || !activityEnd.isValid() || !activityStart.isBefore(activityEnd)) {
    return [];
  }

  return items
    .filter((item) => {
      const itemStart = moment(item.StartTime);
      const itemEnd = moment(item.EndTime);

      if (!itemStart.isValid() || !itemEnd.isValid()) {
        return false;
      }

      if (activity.id && item.Id && activity.id === item.Id) {
        return false;
      }

      return activityStart.isBefore(itemEnd) && activityEnd.isAfter(itemStart);
    })
    .map((item) => `Potential conflict with ${item.Subject ?? "Untitled event"}`);
};
