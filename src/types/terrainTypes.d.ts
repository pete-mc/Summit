export type TerrainCacheData = TerrainLogbook[] | TerrainEvent[] | TerrainUnitMemberMetric[];
export interface TerrainCache {
  type: string;
  data: TerrainCacheData;
  ttl: number;
}
export interface TerrainLogbook {
  id?: string;
  title?: string;
  start_date?: string;
  achievement_meta: {
    stream: string;
    branch: string;
  };
  end_date?: string;
  distance_travelled?: number;
  distance_walkabout?: number;
  categories?: string[];
  details?: {
    other_participants: string;
    activity_time_length: string;
    activity_grade: string;
    event_id: string;
    purpose: string;
    who_lead: string;
    verifier: {
      name: string;
      contact: string;
    };
    weather: string;
    location: string;
    event_title: string;
    your_role: string;
  };
}

export interface TerrainEvent {
  id?: string;
  status?: string;
  title?: string;
  justification?: string;
  achievement_pathway_logbook_data?: TerrainLogbook;
  achievement_pathway_oas_data?: {
    award_rule: string;
    verifier: {
      name: string;
      contact: string;
      type: string;
    };
    groups: unknown[];
  };
  attendance?: {
    leader_members?: Array<{
      id: string;
      first_name: string;
      last_name: string;
    }>;
    assistant_members?: Array<{
      id: string;
      first_name: string;
      last_name: string;
    }>;
    attendee_members?: Array<{
      id: string;
      first_name: string;
      last_name: string;
    }>;
  };
  equipment_notes?: string;
  schedule_items?: TerrainEventScheduleItem[];
  challenge_area?: string;
  description?: string;
  end_datetime: string;
  invitees?: Array<{
    invitee_id: string;
    invitee_type: string;
  }>;
  location?: string;
  organisers?: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  owner_id?: string;
  owner_type?: string;
  review?: {
    scout_method_elements: string[];
  };
  start_datetime: string;
  uploads?: never[];
}

export interface TerrainUnitMemberMetric {
  member_id: string;
  name: string;
  age: string;
  intro_to_scouts: string;
  intro_to_section: string;
  personal_development: string;
  adventurous_journey: string;
  personal_reflection: string;
  sia: {
    completed_projects: number;
    completed_areas: string[];
    in_progress: number;
  };
  peak_award: {
    adventurous_journey: number;
    personal_development: number;
    personal_reflection: number;
    milestones: number;
    oas: number;
    sia: number;
    total: number;
  };
  unit_attendance: number;
  total_attendance: number;
  milestone: {
    milestone: number;
    awarded: boolean;
    participates: Array<{
      challenge_area: string;
      total: number;
    }>;
    status_updated: string;
    total_assists: number;
    total_leads: number;
  };
  milestones: Array<{
    milestone: number;
    awarded: boolean;
    participates: Array<{
      challenge_area: string;
      total: number;
    }>;
    status_updated: string;
    total_assists: number;
    total_leads: number;
  }>;
  oas: {
    total_progressions: number;
    highest: Array<{
      stream: string;
      stage: number;
      branch: string;
    }>;
  };
}

interface ProfileUnit {
  id: string;
  name: string;
  roles: string[];
  section: string;
}

interface ProfileGroup {
  id: string;
  name: string;
  roles: string[];
}

interface ProfileMember {
  id: string;
  name: string;
  roles: string[];
}

interface ProfileBranch {
  id: string;
  name: string;
  roles: string[];
}

export interface TerrainProfile {
  unit: ProfileUnit;
  group: ProfileGroup;
  member: ProfileMember;
  branch?: ProfileBranch;
}

export interface TerrainEventScheduleItem {
  start_datetime: string;
  end_datetime: string;
  description: string;
  leader_notes: string;
  assistant_notes: string;
}

export interface TerrainAchievements {
  id: string;
  member_id: string;
  section: TerrainAchievementsSection;
  type: TerrainAchievementsType;
  status: TerrainAchievementsStatus;
  status_updated: string;
  milestone_requirement_status?: TerrainAchievementsMilestoneRequirementStatus;
  event_log?: TerrainAchievementsEventLog[];
  event_count?: TerrainAchievementsEventCount;
  achievement_meta?: TerrainAchievementMeta;
  template?: string;
  version?: number;
  answers?: Record<string, string[] | boolean | TerrainAchievementsAnswerClass | string>;
  imported?: TerrainAchievementsImported;
  last_updated?: string;
  latest_submission?: TerrainAchievementsLatestSubmission;
  expiry_date?: string;
  uploads?: TerrainAchievementsUpload[];
  can_archive?: boolean;
}

export interface TerrainAchievementMeta {
  stage?: number;
  stream?: TerrainAchievementsStream;
  branch?: string;
  additional_award_id?: string;
}

export enum TerrainAchievementsStream {
  Alpine = "alpine",
  Aquatics = "aquatics",
  Boating = "boating",
  Bushcraft = "bushcraft",
  Bushwalking = "bushwalking",
  Camping = "camping",
  Cycling = "cycling",
  Paddling = "paddling",
  Vertical = "vertical",
}

export interface TerrainAchievementsAnswerClass {
  end_date: string;
  start_date: string;
}

export interface TerrainAchievementsEventCount {
  participant: TerrainAchievementsAssistant;
  assistant: TerrainAchievementsAssistant;
  leader: TerrainAchievementsAssistant;
}

export interface TerrainAchievementsAssistant {
  community: number;
  outdoors: number;
  creative: number;
  personal_growth: number;
}

export interface TerrainAchievementsEventLog {
  credit_type: TerrainAchievementsCreditType;
  challenge_area: TerrainAchievementsChallengeArea;
  event_id: string;
  event_name: string;
  event_start_datetime: string;
}

export enum TerrainAchievementsChallengeArea {
  Community = "community",
  Creative = "creative",
  Outdoors = "outdoors",
  PersonalGrowth = "personal_growth",
}

export enum TerrainAchievementsCreditType {
  Assistant = "assistant",
  Leader = "leader",
  Participant = "participant",
}

export interface TerrainAchievementsImported {
  date_awarded?: string;
  awarded_by?: TerrainAchievementsAwardedBy;
  event_count?: TerrainAchievementsEventCount;
}

export interface TerrainAchievementsAwardedBy {
  id: string;
  name: string;
}

export interface TerrainAchievementsLatestSubmission {
  submission_id: string;
  unit_id: string;
  submission_time: string;
}

export enum TerrainAchievementsMilestoneRequirementStatus {
  Complete = "complete",
  Incomplete = "incomplete",
}

export enum TerrainAchievementsSection {
  Cub = "cub",
  Joey = "joey",
  Rover = "rover",
  Scout = "scout",
  Venturer = "venturer",
}

export enum TerrainAchievementsStatus {
  Awarded = "awarded",
  DraftApproval = "draft_approval",
  DraftReview = "draft_review",
  InProgress = "in_progress",
  NotRequired = "not_required",
}

export enum TerrainAchievementsType {
  AdditionalAward = "additional_award",
  AdventurousJourney = "adventurous_journey",
  CourseReflection = "course_reflection",
  IntroScouting = "intro_scouting",
  IntroSection = "intro_section",
  Milestone = "milestone",
  OutdoorAdventureSkill = "outdoor_adventure_skill",
  PeakAward = "peak_award",
  PersonalReflection = "personal_reflection",
  SpecialInterestArea = "special_interest_area",
}

export interface TerrainAchievementsUpload {
  id: string;
  filename: string;
  bucket: string;
  key: string;
  url: string;
  uploaded_on: string;
}

export interface TerrainUnitMember {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  status: string;
  date_of_birth: string;
  groups: TerrainUnitMemberGroup[];
  unit: Unit;
  patrol: TerrainUnitMemberPatrol | null;
  metadata: TerrainUnitMemberMetadata;
}

export interface TerrainUnitMemberGroup {
  id: string;
  name: string;
}

export interface TerrainUnitMemberMetadata {
  "achievement-import": string;
}

export interface TerrainUnitMemberPatrol {
  id: string;
  name: string;
  duty: TerrainUnitMemberDuty;
}

export enum TerrainUnitMemberDuty {
  AdultLeader = "adult_leader",
  Member = "member",
}

export interface Unit {
  id: string;
  section: string;
  duty: TerrainUnitMemberDuty;
  unit_council: boolean;
  group_id: string;
}

export interface TerrainEventSummary {
  id: string;
  start_datetime: string;
  end_datetime: string;
  title: string;
  invitee_type: string;
  status: string;
  challenge_area: string;
  section: string;
  invitee_id: string;
  invitee_name: string;
  group_id: string;
}

export interface SIATemplate {
  template: string;
  version: number;
  document: Document[];
}

export interface Document {
  title: string;
  input_groups: InputGroup[];
}

export interface InputGroup {
  title?: string;
  inputs: Input[];
}

export interface Input {
  id: string;
  type: string;
  rules?: string;
  multi_select?: boolean;
  label: string;
  selections?: Selection[];
  alt?: string;
  links?: Link[];
  tabs?: Tab[];
}

export interface Link {
  url: string;
  text: string;
}

export interface Selection {
  id: string;
  title: string;
  asset?: string;
}

export interface Tab {
  title: string;
  selections: Selection[];
}

// Generated by https://quicktype.io

export interface TerrrainPostEvent {
  title: string;
  description: string;
  justification: string;
  organisers: string[];
  challenge_area: string;
  start_datetime: string;
  end_datetime: string;
  event_type: EventType;
  attendance: Attendance;
  schedule_items: TerrainEventScheduleItem[];
  achievement_pathway_oas_data: AchievementPathwayOasData;
  achievement_pathway_logbook_data: AchievementPathwayLogbookData;
  review: Review;
  uploads: string[];
  equipment_notes?: string;
  additional_notes?: string;
  location: string;
  iana_timezone: string;
  status: string;
}

export interface AchievementPathwayLogbookData {
  distance_travelled?: number;
  distance_walkabout?: number;
  achievement_meta: AchievementMeta;
  categories?: string[];
  details?: Details;
  verifier?: Verifier;
}

export interface AchievementMeta {
  stream: string;
  branch: string;
}

export interface Details {
  activity_time_length: string;
  activity_grade: string;
}

export interface Verifier {
  name: string;
  contact: string;
  type: string;
}

export interface AchievementPathwayOasData {
  award_rule: string;
  verifier: Verifier;
  groups: string[];
}

export interface Attendance {
  leader_member_ids: string[];
  assistant_member_ids: string[];
  attendee_member_ids: string[];
}

export interface EventType {
  type: string;
  id: string;
}

export interface Review {
  general_tags: string[];
  scout_method_elements: string[];
  scout_spices_elements: string[];
}

// Generated by https://quicktype.io

export interface TerrrainCalendarResult {
  member_id?: string;
  own_calendars?: TerrainCalendar[];
  other_calendars?: TerrainCalendar[];
}
export interface TerrainCalendar {
  id: string;
  type: string;
  title: string;
  selected: boolean;
  section: string;
}
