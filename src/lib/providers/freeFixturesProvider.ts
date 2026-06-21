import fixturesData from "../../../data/worldcup-fixtures.json";
import { WorldCupData } from "../../types";

export async function fetchFreeFixtures(): Promise<WorldCupData> {
  const url = process.env.FREE_FIXTURES_URL || process.env.THE_STATS_API_URL;
  if (url) {
    console.log(`[FreeFixtures] Fetching fixtures from custom URL: ${url}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        return {
          matches: data.matches || fixturesData.matches,
          standings: data.standings || fixturesData.standings,
          bracket: data.bracket || fixturesData.bracket,
          source: "free-fixtures-url",
          isMock: false,
          isFallback: true
        };
      }
      throw new Error(`Free Fixture URL returned status ${res.status}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.warn("[FreeFixtures] Custom URL fetch failed, falling back to local file:", err.message || err);
    }
  }
  
  return {
    ...(fixturesData as WorldCupData),
    source: "free-fixtures-local",
    isMock: false,
    isFallback: true
  };
}
