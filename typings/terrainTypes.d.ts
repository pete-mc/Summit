export type TerrainCacheData = TerrainLogbook[] | TerrainEvent[] | TerrainProfile | TerrainUnitMember[];
export interface TerrainCache {
  type: string;
  data: TerrainCacheData;
  ttl: number;
}
export interface TerrainLogbook {
  id?: string;
  title: string;
  start_date: string;
  achievement_meta: {
    stream: string;
    branch: string;
  };
  end_date: string;
  distance_travelled: number;
  distance_walkabout: number;
  categories: string[];
  details: {
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
  status: string;
  title: string;
  achievement_pathway_logbook_data: TerrainLogbook;
  achievement_pathway_oas_data: {
    award_rule: string;
    verifier: {
      name: string;
      contact: string;
      type: string;
    };
    groups: unknown[];
  };
  attendance: {
    leader_members: unknown[];
  };
  challenge_area: string;
  description: string;
  end_datetime: string;
  invitees: {
    invitee_id: string;
    invitee_type: string;
  }[];
  location: string;
  organisers: {
    id: string;
    first_name: string;
    last_name: string;
  }[];
  owner_id: string;
  owner_type: string;
  review: {
    scout_method_elements: string[];
  };
  start_datetime: string;
}

export interface TerrainUnitMember {
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
    participates: {
      challenge_area: string;
      total: number;
    }[];
    status_updated: string;
    total_assists: number;
    total_leads: number;
  };
  milestones: {
    milestone: number;
    awarded: boolean;
    participates: {
      challenge_area: string;
      total: number;
    }[];
    status_updated: string;
    total_assists: number;
    total_leads: number;
  }[];
  oas: {
    total_progressions: number;
    highest: {
      stream: string;
      stage: number;
      branch: string;
    }[];
  };
}

export interface TerrainProfile {
  username: string;
  profiles: Profile[];
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

interface Profile {
  unit: ProfileUnit;
  group: ProfileGroup;
  member: ProfileMember;
}
