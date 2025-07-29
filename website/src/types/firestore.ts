// Base interface for all Firestore documents
export interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Fighter data model
export interface Fighter extends BaseDocument {
  fighterCode: string;
  fighterName: string;
  // Legacy fields for backward compatibility
  name?: string;
  nickname?: string;
  weightClass?: string;
  record?: {
    wins: number;
    losses: number;
    draws: number;
    noContests: number;
  };
  height?: string;
  reach?: string;
  stance?: 'orthodox' | 'southpaw' | 'switch';
  team?: string;
  country?: string;
  imageUrl?: string;
  Image?: string;  // Adding the Image field
  weight?: string;  // Adding the weight field
  isActive?: boolean;
  
  // Additional fields from your actual data
  AdjustedAge?: number;
  CardioGrade?: number;
  CenterOctagon?: number;
  ChinGrade?: number;
  ClutchGrade?: number;
  DamageTaken?: number;
  DefensiveGrade?: number;
  FighterConsistency?: number;
  FighterGrade?: number;
  FighterMomentum?: number;
  FighterOutput?: number;
  FightsTracked?: number;
  GrapplingGrade?: number;
  HiMagFightsTracked?: number;
  HiMagLeftHook?: number;
  HiMagLeftJab?: number;
  HiMagLeftStraight?: number;
  HiMagLeftUppercut?: number;
  HiMagRightHook?: number;
  HiMagRightJab?: number;
  HiMagRightStraight?: number;
  HiMagRightUppercut?: number;
  KickingGrade?: number;
  MinutesTracked?: number;
  NumberOfKnockDowns?: number;
  NumberOfStuns?: number;
  OffensiveGrade?: number;
  PunchingGrade?: number;
  PushedBackToCage?: number;
  PushingAgainstCage?: number;
  RoundsTracked?: number;
  StrengthOfSchedule?: number;
  StrikerMatchup?: number;
  StrikingGrade?: number;
  SubmissionDefenseGrade?: number;
  SubmissionGrade?: number;
  TakedownDefenseGrade?: number;
  TakedownEfficiency?: number;
  TimesKnockedDownAA?: number;
  Total23FightsTracked?: number;
  TotalComboMinutes?: number;
  TotalPositionPoints?: number;
  WrestlerMatchup?: number;
  
  // Stats objects
  clinch_stats?: any;
  defensive_stats?: any;
  fight_outcome_stats?: any;
  gameplan_stats?: any;
  ground_stats?: any;
  knockout_stats?: any;
  left_hand_stats?: any;
  right_hand_stats?: any;
  round_stats?: any;
  stance_matchup_stats?: any;
  striking_stats?: any;
  submission_stats?: any;
  takedown_stats?: any;
  total_stats?: any;
}

// Fight data model
export interface Fight extends BaseDocument {
  actualRounds: number;
  eventCode: string;
  fightCode: string;
  fighterA: string;
  fighterB: string;
  finalRoundTime: string;
  gender: 'Male' | 'Female';
  isTitleFight: 'Yes' | 'No';
  methodOfFinish: 'KO' | 'TKO' | 'SUB' | 'DEC' | 'DQ' | 'NC';
  scheduledRounds: number;
  weightClass: string;
}

// Fight statistics data model
export interface FightStats extends BaseDocument {
  fightId: string;
  fighterId: string;
  fighterName: string;
  opponentId: string;
  opponentName: string;
  
  // Striking stats
  strikes: {
    total: number;
    significant: number;
    head: number;
    body: number;
    leg: number;
    distance: number;
    clinch: number;
    ground: number;
  };
  
  // Grappling stats
  grappling: {
    takedowns: {
      attempted: number;
      landed: number;
    };
    takedownDefense: {
      attempted: number;
      defended: number;
    };
    submissions: {
      attempted: number;
      landed: number;
    };
    reversals: number;
    controlTime: number; // in seconds
  };
  
  // Other stats
  knockdowns: number;
  passes: number;
  strikesAbsorbed: number;
  significantStrikesAbsorbed: number;
}

// Event data model
export interface Event {
  id: string;
  Date: string;
  EventCode: string;
  EventName: string;
  Fans: 'Yes' | 'No';
  PPV: 'Yes' | 'No';
  numOfFights: number;
  // Keep lowercase versions for backward compatibility
  date?: string;
  eventCode?: string;
  eventName?: string;
  fans?: 'Yes' | 'No';
  ppv?: 'Yes' | 'No';
}

// User preferences/data model
export interface UserProfile extends BaseDocument {
  userId: string;
  email: string;
  displayName?: string;
  favoriteFighters: string[]; // Array of fighter IDs
  favoriteEvents: string[]; // Array of event IDs
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'auto';
    weightClasses: string[];
  };
}

export interface WeightClass {
  id: string;
  weight: number;
  weightclassname: string;
  // Submission attempts
  AmericanaAttempts: number;
  AnacondaAttempt: number;
  CalfSlicerAttempts: number;
  EzekielAttempt: number;
  GogoplataAttempts: number;
  KneebarAttempt: number;
  LeglockAttempt: number;
  NeckCrankAttempt: number;
  OmoplataAttempt: number;
  OtherSubAttempt: number;
  SUBRNCAttempt: number;
  SubArmTriangleAttempt: number;
  SubAttempts: number;
  SubDarceAttempt: number;
  SubGuillotineAttempt: number;
  SubHeelHookAttempt: number;
  SubKimuraAttempt: number;
  SubNeckCrankAttempt: number;
  SubStraightArmLockAttempt: number;
  SubSulovStretchAttempt: number;
  SubTriangleArmbarAttempt: number;
  SubTriangleAttempt: number;
  TwisterAttempts: number;
  VonFlueAttempt: number;
  BulldogAttempt: number;

  // Takedown attempts
  AttemptedThrowTD: number;
  BodyLockTakedownAttempts: number;
  DoubleLegTakedownAttempts: number;
  SingleLegTakedownAttempts: number;
  TripTakedownAttempts: number;

  // Strikes absorbed
  BodyKicksAbsorbed: number;
  HeadKicksAbsorbed: number;
  HooksAbsorbed: number;
  JabsAbsorbed: number;
  LegKicksAbsorbed: number;
  OverhandsAbsorbed: number;
  StraightsAbsorbed: number;
  UppercutsAbsorbed: number;

  // Clinch strikes
  ClinchStrikeHiMake: number;
  ClinchStrikeLoMake: number;
  TotalClinchStrikesMade: number;
  TotalClinchStrikesThrown: number;

  // Ground strikes
  GroundStrikeHiMake: number;
  GroundStrikeLoMake: number;
  TotalGroundStrikesMade: number;
  TotalGroundStrikesThrown: number;

  // Left side strikes
  LeftBodyKickMake: number;
  LeftElbowMake: number;
  LeftHighKickMake: number;
  LeftHookHiMake: number;
  LeftHookLoMake: number;
  LeftJabHiMake: number;
  LeftJabLoMake: number;
  LeftLegKickMake: number;
  LeftOverhandMake: number;
  LeftSpinBackFistMake: number;
  LeftStraightHiMake: number;
  LeftStraightLoMake: number;
  LeftUppercutHiMake: number;
  LeftUppercutLoMake: number;

  // Right side strikes
  RightBodyKickMake: number;
  RightElbowMake: number;
  RightHighKickMake: number;
  RightHookHiMake: number;
  RightHookLoMake: number;
  RightJabHiMake: number;
  RightJabLoMake: number;
  RightLegKickMake: number;
  RightOverhandMake: number;
  RightSpinBackFistMake: number;
  RightStraightHiMake: number;
  RightStraightLoMake: number;
  RightUppercutHiMake: number;
  RightUppercutLoMake: number;

  // Total strikes
  TotalBodyKicksMade: number;
  TotalBodyKicksMake: number;
  TotalBodyKicksThrown: number;
  TotalElbowsMade: number;
  TotalElbowsThrown: number;
  TotalHighKicksMade: number;
  TotalHighKicksThrown: number;
  TotalHooksMade: number;
  TotalHooksThrown: number;
  TotalJabsMade: number;
  TotalJabsThrown: number;
  TotalKicksLanded: number;
  TotalKicksThrown: number;
  TotalLegKicksMade: number;
  TotalLegKicksThrown: number;
  TotalOverhandsMade: number;
  TotalOverhandsThrown: number;
  TotalPunchesLanded: number;
  TotalPunchesThrown: number;
  TotalSpinBackFistsMade: number;
  TotalSpinBackFistsThrown: number;
  TotalStraightsMade: number;
  TotalStraightsThrown: number;
  TotalStrikesLanded: number;
  TotalUppercutsMade: number;
  TotalUppercutsThrown: number;

  // Win/Loss records
  LossesVsOrthodox: number;
  LossesVsSouthpaw: number;
  LossesVsSwitch: number;
  WinsVsOrthodox: number;
  WinsVsSouthpaw: number;
  WinsVsSwitch: number;
  decloss: number;
  decwin: number;
  koloss: number;
  kowins: number;
  subloss: number;
  subwin: number;
  tkoloss: number;
  tkowins: number;

  // Fight statistics
  fights: number;
  minutes: number;
  numberofknockdowns: number;
  numberofstuns: number;
  rounds: number;
  subattempt: number;
  timesknockeddown: number;
  timesstunned: number;
}

// Collection names for type safety
export const COLLECTIONS = {
  FIGHTERS: 'fighterData',
  FIGHTS: 'fights',
  FIGHT_STATS: 'fightStats',
  EVENTS: 'events',
  USER_PROFILES: 'userProfiles',
  WEIGHT_CLASSES: 'weightClass',
} as const;

// Type for collection names
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]; 