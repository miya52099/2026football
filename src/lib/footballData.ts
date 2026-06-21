import { WorldCupData, Match, GroupStanding, BracketRound } from "../types";
import mockData from "../data/mock-worldcup.json";

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
  const token = apiKey || process.env.FOOTBALL_DATA_API_KEY;

  if (!token) {
    console.log("[FootballData] No API Key found, using local mock data.");
    return {
      ...(mockData as WorldCupData),
      dataSource: "mock",
      source: "mock",
      isMock: true,
      isFallback: false,
      lastUpdated: getCurrentFormattedTime()
    };
  }

  try {
    console.log("[FootballData] Fetching live data from football-data.org...");
    
    // World Cup Tournament ID is 2000 (or competition code 'WC')
    const headers = { "X-Auth-Token": token };
    
    const [matchesRes, standingsRes] = await Promise.all([
      fetch("https://api.football-data.org/v4/competitions/WC/matches", { headers }),
      fetch("https://api.football-data.org/v4/competitions/WC/standings", { headers })
    ]);

    if (!matchesRes.ok || !standingsRes.ok) {
      throw new Error(`API returned error statuses: matches(${matchesRes.status}) standings(${standingsRes.status})`);
    }

    const matchesJson = await matchesRes.json();
    const standingsJson = await standingsRes.json();

    const rawMatches = matchesJson.matches || [];
    const rawStandings = standingsJson.standings || [];

    // 1. Process matches
    const matches: Match[] = rawMatches.map((m: any) => {
      // Map API status to ours (SCHEDULED, LIVE, FINISHED)
      let status: "SCHEDULED" | "LIVE" | "FINISHED" = "SCHEDULED";
      if (m.status === "IN_PLAY" || m.status === "PAUSED" || m.status === "LIVE") {
        status = "LIVE";
      } else if (m.status === "FINISHED" || m.status === "AWARDED") {
        status = "FINISHED";
      }

      const homeScore = status === "SCHEDULED" ? "尚未開始" : (m.score?.fullTime?.home ?? 0);
      const awayScore = status === "SCHEDULED" ? "尚未開始" : (m.score?.fullTime?.away ?? 0);

      const groupClean = translateGroup(m.group);
      
      return {
        id: String(m.id || `m-${Math.random()}`),
        group: groupClean,
        stage: translateStage(m.stage),
        homeTeam: translateTeam(m.homeTeam?.name || m.homeTeam?.shortName),
        awayTeam: translateTeam(m.awayTeam?.name || m.awayTeam?.shortName),
        homeScore,
        awayScore,
        status,
        utcDate: m.utcDate,
        localDate: formatLocalDate(m.utcDate),
        venue: m.venue || "世界盃體育場"
      };
    });

    // 2. Process standings
    const standings: GroupStanding[] = rawStandings
      .filter((s: any) => s.type === "TOTAL")
      .map((s: any) => {
        return {
          group: translateGroup(s.group),
          teams: (s.table || []).map((row: any) => ({
            team: translateTeam(row.team?.name || row.team?.shortName),
            played: row.playedGames || 0,
            won: row.won || 0,
            draw: row.draw || 0,
            lost: row.lost || 0,
            goalsFor: row.goalsFor || 0,
            goalsAgainst: row.goalsAgainst || 0,
            goalDifference: row.goalDifference || 0,
            points: row.points || 0
          }))
        };
      });

    // 3. Process bracket (extracting knockout matches)
    // We group knockout matches into distinct rounds
    const roundsMap: Record<string, Match[]> = {
      "Round of 32": [],
      "Round of 16": [],
      "Quarter-finals": [],
      "Semi-finals": [],
      "Final": []
    };

    matches.forEach(m => {
      if (m.stage === "32強賽") {
        roundsMap["Round of 32"].push(m);
      } else if (m.stage === "16強賽") {
        roundsMap["Round of 16"].push(m);
      } else if (m.stage === "半準決賽 (8強)") {
        roundsMap["Quarter-finals"].push(m);
      } else if (m.stage === "準決賽 (4強)") {
        roundsMap["Semi-finals"].push(m);
      } else if (m.stage === "決賽") {
        roundsMap["Final"].push(m);
      }
    });

    const bracket: BracketRound[] = [
      { round: "Round of 32", matches: roundsMap["Round of 32"] },
      { round: "Round of 16", matches: roundsMap["Round of 16"] },
      { round: "Quarter-finals", matches: roundsMap["Quarter-finals"] },
      { round: "Semi-finals", matches: roundsMap["Semi-finals"] },
      { round: "Final", matches: roundsMap["Final"] }
    ];

    // If matches array is empty (or no matches exist yet since it's early), default to mock
    if (matches.length === 0) {
      console.log("[FootballData] API returned empty matches list. Falling back to mock.");
      return {
        ...(mockData as WorldCupData),
        dataSource: "fallback",
        source: "fallback",
        isMock: false,
        isFallback: true,
        lastUpdated: getCurrentFormattedTime()
      };
    }

    return {
      matches,
      standings,
      bracket,
      dataSource: "api",
      source: "api",
      isMock: false,
      isFallback: false,
      lastUpdated: getCurrentFormattedTime()
    };

  } catch (error) {
    console.error("[FootballData] Error fetching from live API:", error);
    console.log("[FootballData] Safe fallback to mock-worldcup.json");
    return {
      ...(mockData as WorldCupData),
      dataSource: "fallback",
      source: "fallback",
      isMock: false,
      isFallback: true,
      lastUpdated: getCurrentFormattedTime()
    };
  }
}
