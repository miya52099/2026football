import { WorldCupData } from "../footballData";

export async function scrapeFifaScores(): Promise<WorldCupData> {
  const url = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures";
  console.log(`[NextJS FifaScraper] Scraping FIFA page: ${url}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 seconds timeout
  
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`FIFA page returned HTTP status ${res.status}`);
    }
    
    const html = await res.text();
    
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextData = JSON.parse(nextDataMatch[1].trim());
        console.log("[NextJS FifaScraper] Parsed internal __NEXT_DATA__ payload...");
      } catch (e: any) {
        console.warn("[NextJS FifaScraper] Failed to parse NEXT_DATA:", e.message || e);
      }
    }
    
    throw new Error("FIFA 2026 World Cup live scores data not yet available on live page (pre-event phase).");
    
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("[NextJS FifaScraper] Scraping failed:", err.message || err);
    throw err;
  }
}
