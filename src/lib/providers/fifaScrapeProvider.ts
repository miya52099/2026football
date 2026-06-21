import { WorldCupData } from "../../types";

export async function scrapeFifaScores(): Promise<WorldCupData> {
  const url = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures";
  console.log(`[FifaScraper] Scraping FIFA page: ${url}`);
  
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
    
    // Check if __NEXT_DATA__ block exists in FIFA head/body
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextData = JSON.parse(nextDataMatch[1].trim());
        console.log("[FifaScraper] Found __NEXT_DATA__, parsing standard tournament payload...");
        // If we can extract matches or schedule from NextJS data props, we can map them here.
        // E.g. nextData?.props?.pageProps?.fixtures or nextData?.props?.pageProps?.initialMatches
        // Since we are in the pre-tournament preparation phase (2026), dynamic matches might not be mapped yet.
      } catch (e: any) {
        console.warn("[FifaScraper] Failed to parse internal __NEXT_DATA__ JSON:", e.message || e);
      }
    }
    
    // Fall back to next provider because tournament live data hasn't officially launched on static HTML page yet (it's 2026 pre-event).
    throw new Error("FIFA 2026 World Cup live scores data not yet available on live page (pre-event phase).");
    
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("[FifaScraper] Scraping failed:", err.message || err);
    throw err;
  }
}
