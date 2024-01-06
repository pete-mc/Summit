/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TerrainRootState {
  aj: Aj;
  approvals: Approvals;
  auth: Auth;
  dataImporter: DataImporter;
  global: Global;
  logbook: Logbook;
  me: Me;
  milestones: Milestones;
  oas: Oas;
  pe: PE;
  persist: Persist;
  personalDevelopment: PersonalDevelopment;
  personalReflection: PersonalReflection;
  programming: Programming;
  sia: Sia;
  snackbar: Snackbar;
  user: RootStateUser;
}

interface Aj {
  journeyTemplate: Template;
  reviewTemplate: ReviewTemplate;
  journeyList: any[];
  currentJourneySubmission: Current;
  journeyInitialStep: number;
  reviewMode: boolean;
}

interface Current {
  id: string;
  template: string;
  version: number;
  section: string;
  answers: ReviewTemplate;
  status: string;
  status_updated: string;
  achievement_meta: ReviewTemplate;
  uploads: any[];
  event_log: any[];
  milestone_requirement_status: string;
  imported: ReviewTemplate;
  latest_submission: LatestSubmission;
}

interface ReviewTemplate {}

interface LatestSubmission {
  submission_id: string;
  submission_time: string;
  unit_id: string;
}

interface Template {
  template: string;
  version: number;
  document: ReviewTemplate;
}

interface Approvals {
  approvalsData: any[];
  lastApprovalsData: any[];
  approvalsHistoryData: any[];
  submissionQueue: any[];
  isReviewing: boolean;
  approveModal: boolean;
  rejectModal: boolean;
  archiveModal: boolean;
  currentAchievement: null;
  currentSubmission: CurrentSubmission;
}

interface CurrentSubmission {
  achievementId: string;
  achievementType: string;
  submissionId: string;
  submissionType: string;
  date: string;
  name: string;
  memberId: string;
  pathway: string;
  request_type: string;
}

interface Auth {
  accessToken: string;
  admin: Admin;
  adminLoggedInAsMember: boolean;
  adminLogInTime: number;
  authenticated: boolean;
  idToken: string;
  isAdminSite: boolean;
  lastIdTokenTime: number;
  refreshToken: string;
  showTimeoutNotice: boolean;
  user: AuthUser;
}

interface Admin {
  fullName: string;
  username: string;
}

interface AuthUser {
  username: string;
  pool: Pool;
  Session: null;
  client: Client;
  signInUserSession: SignInUserSession;
  authenticationFlowType: string;
  storage: { [key: string]: string };
  keyPrefix: string;
  userDataKey: string;
  attributes: Attributes;
  preferredMFA: string;
}

interface Attributes {
  sub: string;
  email_verified: boolean;
  email: string;
}

interface Client {
  endpoint: string;
  fetchOptions: ReviewTemplate;
}

interface Pool {
  userPoolId: string;
  clientId: string;
  client: Client;
  advancedSecurityDataCollectionFlag: boolean;
  storage: { [key: string]: string };
}

interface SignInUserSession {
  idToken: IDToken;
  refreshToken: RefreshToken;
  accessToken: AccessToken;
  clockDrift: number;
}

interface AccessToken {
  jwtToken: string;
  payload: AccessTokenPayload;
}

interface AccessTokenPayload {
  sub: string;
  event_id: string;
  token_use: string;
  scope: string;
  auth_time: number;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
  client_id: string;
  username: string;
}

interface IDToken {
  jwtToken: string;
  payload: IDTokenPayload;
}

interface IDTokenPayload {
  sub: string;
  aud: string;
  email_verified: boolean;
  event_id: string;
  token_use: string;
  auth_time: number;
  iss: string;
  "cognito:username": string;
  exp: number;
  iat: number;
  email: string;
}

interface RefreshToken {
  token: string;
}

interface DataImporter {
  hasChanged: boolean;
  showUnsavedDialog: boolean;
  toRoute: string;
  selectRef: string;
}

interface Global {
  adultViewingYouthBasecamp: boolean;
  appRemountKey: number;
  appSection: Section;
  basecampLeaders: boolean;
  basecampRemountKey: number;
  breadcrumbs: Breadcrumb[];
  firstLoad: boolean;
  toolbar: Toolbar[];
  loading: boolean;
  navRestricted: boolean;
  offline: boolean;
  route: string;
  routePrev: string;
  isroupStatusSnackbarShowing: boolean;
  isngGroupStats: boolean;
  poller: number;
}

declare enum Section {
  Cub = "cub",
  Joey = "joey",
  Rover = "rover",
  Scout = "scout",
  Venturer = "venturer",
}

interface Breadcrumb {
  text: string;
  to: string;
  exact: boolean;
  disabled: boolean;
}

interface Toolbar {
  name: string;
  active: boolean;
}

interface Logbook {
  record: Record;
}

interface Record {
  id: string;
  title: string;
  area: string;
  date: string;
}

interface Me {
  membersData: MembersDatum[];
  unitMembersData: UnitMembersDatum[];
  patrolsData: PatrolsDatum[];
  unitsData: CurrentUnit[];
  groups: any[];
  importedMember: ReviewTemplate;
  importedMemberAchievements: any[];
  requestPending: boolean;
  currentUnit: CurrentUnit;
}

interface CurrentUnit {
  id: string;
  name: InviteeNameEnum;
  section: Section;
  group_id: string;
}

declare enum InviteeNameEnum {
  MountCottonCubUnit = "Mount Cotton Cub Unit",
  MountCottonJoeyUnit = "Mount Cotton Joey Unit",
  MountCottonRoverUnit = "Mount Cotton Rover Unit ",
  MountCottonScoutUnit = "Mount Cotton Scout Unit",
  MountCottonVenturerUnit = "Mount Cotton Venturer Unit",
  RoverCrew = "Rover Crew",
}

interface MembersDatum {
  id: string;
  first_name: string;
  last_name: string;
  status: Status;
  member_number: string;
  date_of_birth: string;
  metadata: Metadata;
  units: MembersDatumUnit[];
  role: Role;
  unit: MembersDatumUnit | null;
  patrol: Patrol | null;
}

interface Metadata {
  "achievement-import"?: string;
}

interface Patrol {
  id: string;
  name: string;
  duty: Type;
}

declare enum Type {
  AssistantPatrolLeader = "assistant_patrol_leader",
  Member = "member",
  PatrolLeader = "patrol_leader",
}

declare enum Role {
  Leader = "leader",
  Member = "member",
}

declare enum Status {
  Active = "active",
}

interface MembersDatumUnit {
  id: string;
  name: InviteeNameEnum;
  section: Section;
  duty: Duty;
  unit_council: boolean;
  group: GroupElement;
}

declare enum Duty {
  AdultLeader = "adult_leader",
  Member = "member",
}

interface GroupElement {
  id: string;
  name: GroupName;
}

declare enum GroupName {
  MountCottonScoutGroup = "Mount Cotton Scout Group",
  TaringaMiltonToowongScoutGroup = "Taringa Milton Toowong Scout Group",
}

interface PatrolsDatum {
  id: string;
  unit_id: string;
  name: string;
}

interface UnitMembersDatum {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  status: Status;
  date_of_birth: string;
  groups: GroupElement[];
  unit: UnitElement;
  patrol: Patrol | null;
  metadata: Metadata;
}

interface UnitElement {
  id: string;
  section: Section;
  duty: Duty;
  unit_council: boolean;
  group_id?: string;
}

interface Milestones {
  selectedMilestone: number;
  infoDialogVisibility: boolean;
  infoDialogType: string;
  list: any[];
  reviewTemplate: MilestonesReviewTemplate;
  current: Current;
  reviewMode: boolean;
}

interface MilestonesReviewTemplate {
  template: string;
  version: number;
  document: Document[];
}

interface Document {
  input_groups: InputGroup[];
}

interface InputGroup {
  inputs: Input[];
}

interface Input {
  id: string;
  type: string;
  label: string;
  alt?: string;
  multi_select?: boolean;
  selections?: Selection[];
  link?: Link;
}

interface Link {
  label: string;
  url: string;
}

interface Selection {
  id: string;
  title: string;
  asset: string;
}

interface Oas {
  oasTemplate: Template;
  currentOasSubmission: Current;
  oasList: any[];
  stream: string;
  branch: string;
  stage: string;
  templateLink: null;
  streamTitle: string;
  streamTree: StreamTree;
  verifyModal: boolean;
  reviewMode: boolean;
  showVerifierModal: boolean;
  statementsForVerification: any[];
  verifierForSelectedStatements: ReviewTemplate;
  isNewStageSubmission: boolean;
}

interface StreamTree {
  data: Data;
  status: number;
  statusText: string;
  headers: StreamTreeHeaders;
  config: Config;
  request: ReviewTemplate;
}

interface Config {
  transitional: Transitional;
  transformRequest: null[];
  transformResponse: null[];
  timeout: number;
  xsrfCookieName: string;
  xsrfHeaderName: string;
  maxContentLength: number;
  maxBodyLength: number;
  env: Env;
  headers: ConfigHeaders;
  method: string;
  url: string;
}

interface Env {
  FormData: null;
}

interface ConfigHeaders {
  Accept: string;
}

interface Transitional {
  silentJSONParsing: boolean;
  forcedJSONParsing: boolean;
  clarifyTimeoutError: boolean;
}

interface Data {
  title: string;
  stream_id: string;
  description: string;
  tree: Tree;
}

interface Tree {
  branch_id: string;
  title: string;
  stage: number;
  template_link: string;
  children: Tree[];
}

interface StreamTreeHeaders {
  "cache-control": string;
  "content-length": string;
  "content-type": string;
  "last-modified": string;
}

interface PE {
  scoutingTemplate: Template;
  sectionTemplate: Template;
  scoutingList: any[];
  sectionList: any[];
  currentScoutingSubmission: Current;
  currentSectionSubmission: Current;
}

interface Persist {
  lastKnownUserProfile: LastKnownUserProfile;
}

interface LastKnownUserProfile {
  profileIndex: number;
  username: string;
}

interface PersonalDevelopment {
  list: any[];
  template: ReviewTemplate;
  current: null;
  reviewMode: boolean;
}

interface PersonalReflection {
  list: any[];
  planTemplate: ReviewTemplate;
  doTemplate: ReviewTemplate;
  reviewTemplate: ReviewTemplate;
  current: Current;
  reviewMode: boolean;
}

interface Programming {
  activity: Activity;
  activityFlow: string;
  calendarToggleVisibility: boolean;
  eventProposalValid: boolean;
  planningImportedActivity: boolean;
  planningProposedActivity: boolean;
  proposal: ReviewTemplate;
  proposedActivitiesData: any[];
  step: number;
}

interface Activity {
  id: string;
  status: string;
  title: string;
  location: string;
  organiser: Organiser;
  organisers: Organiser[];
  challenge_area: string;
  start_datetime: string;
  end_datetime: string;
  attendance: Attendance;
  invitees: Invitee[];
  review: Review;
  owner_type: string;
  owner_id: string;
  achievement_pathway_oas_data: AchievementPathwayOasData;
  achievement_pathway_logbook_data: AchievementPathwayLogbookData;
}

interface AchievementPathwayLogbookData {
  distance_travelled: number;
  distance_walkabout: number;
  achievement_meta: AchievementMeta;
  categories: any[];
  details: Details;
  title: string;
}

interface AchievementMeta {
  stream: string;
  branch: string;
}

interface Details {
  activity_time_length: string;
  activity_grade: string;
}

interface AchievementPathwayOasData {
  award_rule: string;
  verifier: Verifier;
  groups: any[];
}

interface Verifier {
  name: string;
  contact: string;
  type: Type;
}

interface Attendance {
  leader_members: Organiser[];
  assistant_members: Organiser[];
  participant_members: any[];
  attendee_members: any[];
}

interface Organiser {
  id: string;
  first_name: string;
  last_name: string;
  member_number: string;
  patrol_name?: string;
}

interface Invitee {
  invitee_id: string;
  invitee_type: string;
  invitee_name: InviteeNameEnum;
  id: string;
}

interface Review {
  scout_method_elements: string[];
}

interface Sia {
  siaList: any[];
  siaTemplate: ReviewTemplate;
  reviewTemplate: ReviewTemplate;
  siaInitialStep: number;
  currentSia: null;
  reviewMode: boolean;
}

interface Snackbar {
  message: string;
  icon: string;
  timeout: number;
  key: string;
  type: string;
  path: string;
  filename: string;
  isroupStatusSnackbarShowing: boolean;
  isngGroupStats: boolean;
}

interface RootStateUser {
  username: string;
  profileIndex: number;
  datetime_expires: string;
  previousCurrentRoleIndex: number;
  previousCurrentRoleDetails: string;
  primaryUserId: string;
  profiles: Profile[];
  memberDetails: MemberDetails;
}

interface MemberDetails {
  id: string;
  first_name: string;
  last_name: string;
  status: Status;
  role: Role;
  member_number: string;
  date_of_birth: string;
  units: UnitElement[];
  patrols: Patrol[];
  groups: GroupElement[];
}

interface Profile {
  member: MemberClass;
  unit: MemberClass;
  group: MemberClass;
}

interface MemberClass {
  id: string;
  name: string;
  roles: string[];
  section?: Section;
}
