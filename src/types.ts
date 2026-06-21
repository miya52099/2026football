export interface Match {
  id: string;
  group: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null | "尚未開始";
  awayScore: number | null | "尚未開始";
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  utcDate: string;
  localDate: string;
  venue: string;
}

export interface TeamStanding {
  team: string;
  played: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupStanding {
  group: string;
  teams: TeamStanding[];
}

export interface BracketRound {
  round: string;
  matches: Match[];
}

export interface WorldCupData {
  matches: Match[];
  standings: GroupStanding[];
  bracket: BracketRound[];
  dataSource?: "api" | "mock" | "fallback";
  source?: "api" | "mock" | "fallback";
  lastUpdated?: string;
  isMock?: boolean;
  isFallback?: boolean;
}
