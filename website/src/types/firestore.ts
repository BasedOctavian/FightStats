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
  fighter1Id: string;
  fighter2Id: string;
  fighter1Name: string;
  fighter2Name: string;
  eventName: string;
  eventDate: Date;
  weightClass: string;
  rounds: number;
  result: {
    winner: 'fighter1' | 'fighter2' | 'draw' | 'noContest';
    method: 'decision' | 'ko' | 'tko' | 'submission' | 'dqd' | 'draw' | 'noContest';
    round?: number;
    time?: string;
  };
  isMainEvent: boolean;
  isTitleFight: boolean;
  venue?: string;
  location?: string;
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
export interface Event extends BaseDocument {
  name: string;
  date: Date;
  venue: string;
  location: string;
  organization: string;
  isMainCard: boolean;
  fights: string[]; // Array of fight IDs
  imageUrl?: string;
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

// Collection names for type safety
export const COLLECTIONS = {
  FIGHTERS: 'fighterData',
  FIGHTS: 'fights',
  FIGHT_STATS: 'fightStats',
  EVENTS: 'events',
  USER_PROFILES: 'userProfiles',
} as const;

// Type for collection names
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]; 