import { NextRequest, NextResponse } from "next/server";
import { fetchWorldCupDataFromAPI } from "../../../lib/footballData";
import { globalCache } from "../../../lib/cache";

export const dynamic = "force-dynamic";

// Keep a module-scoped timestamp for rate limiting
let lastNextLiveFetchTime = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let forceRefresh = searchParams.get("refresh") === "true";
    
    const cacheKey = "worldcup-next-cache";
    
    // Throttling logic
    const now = Date.now();
    if (forceRefresh && now - lastNextLiveFetchTime < 60000) {
      console.log(`[NextJS API] Throttling active: last live fetch was ${Math.round((now - lastNextLiveFetchTime)/1000)}s ago. Reusing cache if possible.`);
      forceRefresh = false;
    }

    let data = forceRefresh ? null : globalCache.get(cacheKey);

    if (!data) {
      console.log("[NextJS API] Cache miss or force refresh. Fetching data...");
      data = await fetchWorldCupDataFromAPI();
      globalCache.set(cacheKey, data);
      
      // Update our timestamp on successful run
      lastNextLiveFetchTime = Date.now();
    } else {
      console.log("[NextJS API] Cache hit. Returning cached data.");
    }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("[NextJS API Error]:", error);
    try {
      const fallbackData = await fetchWorldCupDataFromAPI();
      return NextResponse.json(fallbackData);
    } catch (innerErr) {
      return NextResponse.json({
        matches: [],
        standings: [],
        bracket: [],
        source: "mock-worldcup.json",
        isMock: true,
        isFallback: true,
        errorMessage: "football-data.org 暫時無法取得 2026 世界盃資料，已切換為備援資料"
      });
    }
  }
}
