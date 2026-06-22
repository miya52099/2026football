import { NextRequest, NextResponse } from "next/server";
import { fetchWorldCupDataFromAPI } from "../../../lib/footballData";

export const dynamic = "force-dynamic";

let apiCacheData: any = null;
let apiCacheTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get("refresh") === "true";
    const now = Date.now();

    if (!forceRefresh && apiCacheData && (now - apiCacheTime < CACHE_TTL)) {
      console.log("[NextJS API] Cache hit. Returning cached data.");
      return NextResponse.json(apiCacheData, {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
        },
      });
    }

    console.log("[NextJS API] Cache miss or force refresh. Fetching data...");
    const data = await fetchWorldCupDataFromAPI();
    apiCacheData = data;
    apiCacheTime = now;

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (error: any) {
    console.error("[NextJS API Error]:", error);
    try {
      const data = await fetchWorldCupDataFromAPI();
      return NextResponse.json(data, { status: 200 });
    } catch (innerErr) {
      return NextResponse.json({
        matches: [],
        standings: [],
        bracket: [],
        source: "mock-worldcup.json",
        isMock: true,
        isFallback: true,
        debug: {
          providerTried: "emergency-fallback",
          source: "mock-worldcup.json",
          matchesCount: 0,
          isFallback: true,
          isMock: true
        }
      }, { status: 200 });
    }
  }
}
