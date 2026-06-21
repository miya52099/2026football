import { WorldCupData, Match, GroupStanding, BracketRound } from "../types";
import mockData from "../data/mock-worldcup.json";
import { scrapeFifaScores } from "./providers/fifaScrapeProvider";
import { fetchFreeFixtures } from "./providers/freeFixturesProvider";
import { getMockData } from "./providers/mockProvider";

let cacheData: WorldCupData | null = null;
let cacheTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in ms

// Team names mapping from English to Traditional Chinese
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
  // e.g., "GROUP_A" -> "A 組", "Group A" -> "A 組"
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
    case "3RD_PLACE":
    case "THIRD_PLACE":
      return "季軍賽";
    default:
      return stage || "小組賽";
  }
}

function formatLocalDate(utcDateString: string): string {
  try {
    const d = new Date(utcDateString);
    if (isNaN(d.getTime())) return utcDateString;
    
    // Format: YYYY-MM-DD HH:MM
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    
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

export async function fetchWorldCupDataFromAPI(apiKey?: string): Promise<WorldCupData> {
  const now = Date.now();
  if (cacheData && (now - cacheTime < CACHE_DURATION)) {
    console.log("[FootballData] Returning cached data.");
    return cacheData;
  }

  const requestedProvider = process.env.SCORE_PROVIDER || "fifa-scrape";
  console.log(`[FootballData] Fetch triggered. Requested Provider: ${requestedProvider}`);

  let result: WorldCupData | null = null;
  const errors: string[] = [];

  // Try the requested provider or default chain
  if (requestedProvider === "fifa-scrape") {
    try {
      result = await scrapeFifaScores();
      result.isFallback = false;
      result.source = "football-data.org";
    } catch (err: any) {
      errors.push(`fifa-scrape failed: ${err.message || err}`);
      console.warn("[FootballData] fifa-scrape failed, falling back to free-fixtures...");
    }
  }

  // Fallback 1: Try free-fixtures (if free-fixtures was explicitly requested OR if fifa-scrape failed)
  if (!result && (requestedProvider === "free-fixtures" || requestedProvider === "fifa-scrape")) {
    try {
      result = await fetchFreeFixtures();
    } catch (err: any) {
      errors.push(`free-fixtures failed: ${err.message || err}`);
      console.warn("[FootballData] free-fixtures failed, falling back to mock...");
    }
  }

  // Fallback 2: Try mock provider (if requested, or if other chains failed)
  if (!result) {
    try {
      const mock = getMockData();
      result = {
        ...mock,
        source: "mock-worldcup.json",
        isMock: true,
        isFallback: true,
        errorMessage: "football-data.org 暫時無法取得 2026 世界盃資料，已切換為備援資料"
      };
    } catch (err: any) {
      errors.push(`mock failed: ${err.message || err}`);
    }
  }

  // Absolute safeguard
  if (!result) {
    result = {
      ...(mockData as WorldCupData),
      source: "mock-worldcup.json",
      isMock: true,
      isFallback: true,
      errorMessage: "football-data.org 暫時無法取得 2026 世界盃資料，已切換為備援資料"
    };
  }

  // Make sure debug and updated states are appended
  result.lastUpdated = getCurrentFormattedTime();
  result.debug = {
    requestedProvider,
    errors,
    timestamp: now
  };

  // Cache successful result
  cacheData = result;
  cacheTime = now;

  return result;
}
