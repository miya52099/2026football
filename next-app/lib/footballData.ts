import mockData from "../data/mock-worldcup.json";
import { scrapeFifaScores } from "./providers/fifaScrapeProvider";
import { fetchFreeFixtures } from "./providers/freeFixturesProvider";
import { getMockData } from "./providers/mockProvider";

let cacheData: WorldCupData | null = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in ms

export interface Match {
  id: string;
  group: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | "尚未開始" | null;
  awayScore: number | "尚未開始" | null;
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
  source?: string;
  lastUpdated?: string;
  isMock?: boolean;
  isFallback?: boolean;
  errorMessage?: string;
  debug?: any;
}

const TEAM_MAP: Record<string, string> = {
  "USA": "美國",
  "United States": "美國",
  "United States of America": "美國",
  "Australia": "澳洲",
  "Mexico": "墨西哥",
  "Netherlands": "荷蘭",
  "Canada": "加拿大",
  "England": "英格蘭",
  "Brazil": "巴西",
  "Germany": "德國",
  "Argentina": "阿根廷",
  "France": "法國",
  "Spain": "西班牙",
  "Japan": "日本",
  "Portugal": "葡萄牙",
  "South Korea": "韓國",
  "Korea Republic": "韓國",
  "Italy": "義大利",
  "Belgium": "比利時",
};

function translateTeam(name: string): string {
  if (!name) return "未知隊伍";
  return TEAM_MAP[name] || name;
}

function translateGroup(groupName: string): string {
  if (!groupName) return "未指定組別";
  const clean = groupName.replace("GROUP_", "").replace("Group ", "").trim();
  if (clean.length === 1) {
    return `${clean} 組`;
  }
  return groupName;
}

function translateStage(stage: string): string {
  switch (stage) {
    case "GROUP_STAGE":
      return "小組賽";
    case "LAST_32":
    case "ROUND_OF_32":
      return "32強賽";
    case "LAST_16":
    case "ROUND_OF_16":
      return "16強賽";
    case "QUARTER_FINALS":
      return "半準決賽 (8強)";
    case "SEMI_FINALS":
      return "準決賽 (4強)";
    case "FINAL":
      return "決賽";
    default:
      return stage || "小組賽";
  }
}

function formatLocalDate(utcDateString: string): string {
  try {
    const d = new Date(utcDateString);
    if (isNaN(d.getTime())) return utcDateString;
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  } catch {
    return utcDateString;
  }
}

function getCurrentFormattedTime(): string {
  try {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  } catch {
    return new Date().toISOString();
  }
}

export async function fetchWorldCupDataFromAPI(): Promise<WorldCupData> {
  const now = Date.now();
  if (cacheData && (now - cacheTime < CACHE_DURATION)) {
    console.log("[NextJS FootballData] Returning cached data.");
    return cacheData;
  }

  console.log(`[NextJS FootballData] Fetching live data...`);

  let result: WorldCupData | null = null;
  let providerTried = "fifa-scrape";
  let source = "";
  let matchesCount = 0;
  let isFallback = false;
  let isMock = false;

  // 1. Try FIFA official page scraper
  try {
    const scraped = await scrapeFifaScores();
    if (scraped && scraped.matches && scraped.matches.length > 0) {
      result = scraped;
      source = "fifa.com";
      isFallback = false;
      isMock = false;
    }
  } catch (err) {
    console.warn("[NextJS FootballData] FIFA scraper failed or pre-event phase. Trying local-fixtures fallback...");
  }

  // 2. Fallback to local-fixtures
  if (!result) {
    try {
      providerTried = "local-fixtures";
      const localData = await fetchFreeFixtures();
      if (localData && localData.matches && localData.matches.length > 0) {
        result = localData;
        source = "local-fixtures";
        isFallback = true;
        isMock = false;
      }
    } catch (err) {
      console.warn("[NextJS FootballData] local-fixtures fallback failed. Trying mock fallback...");
    }
  }

  // 3. Fallback to mock
  if (!result) {
    try {
      providerTried = "mock-worldcup.json";
      const mockResult = getMockData();
      if (mockResult && mockResult.matches && mockResult.matches.length > 0) {
        result = mockResult;
        source = "mock-worldcup.json";
        isFallback = true;
        isMock = true;
      }
    } catch (err) {
      console.warn("[NextJS FootballData] Mock fallback failed.");
    }
  }

  // Absolute safeguard
  if (!result) {
    result = {
      ...(mockData as any),
      source: "mock-worldcup.json",
      isMock: true,
      isFallback: true
    } as unknown as WorldCupData;
    source = "mock-worldcup.json";
    isFallback = true;
    isMock = true;
  }

  matchesCount = result.matches ? result.matches.length : 0;

  result.source = source;
  result.isFallback = isFallback;
  result.isMock = isMock;
  result.lastUpdated = getCurrentFormattedTime();
  result.debug = {
    providerTried,
    source,
    matchesCount,
    isFallback,
    isMock
  };

  // Cache successful result
  cacheData = result;
  cacheTime = now;

  return result;
}
