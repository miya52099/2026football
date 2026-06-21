import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { fetchWorldCupDataFromAPI } from "./src/lib/footballData";
import { globalCache } from "./src/lib/cache";
import { WorldCupData } from "./src/types";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing support
  app.use(express.json());

  // Keep track of the last time we performed a live API fetch
  let lastLiveFetchTime = 0;

  // 1. API Route: /api/worldcup
  app.get("/api/worldcup", async (req, res) => {
    try {
      const cacheKey = "worldcup-data-store";
      let forceRefresh = req.query.refresh === "true";
      
      // Enforce throttling: if they want a forceRefresh but the last fetch was within 60 seconds,
      // override and use cached data (if available) to protect the API rate limits.
      const now = Date.now();
      if (forceRefresh && now - lastLiveFetchTime < 60000) {
        console.log(`[Server API] Throttling active: requested refresh too soon (${Math.round((now - lastLiveFetchTime)/1000)}s ago). Reusing cache if possible.`);
        forceRefresh = false;
      }

      let data = forceRefresh ? null : globalCache.get<WorldCupData>(cacheKey);

      if (!data) {
        console.log("[Server API] Cache miss or force refresh. Re-fetching World Cup data...");
        // Fetch from API (internally fallback to JSON mock if key is missing or is failing)
        data = await fetchWorldCupDataFromAPI();
        
        // Save to 15-minute global cache
        globalCache.set(cacheKey, data);
        
        // Update the timestamp of the live fetch only if we actually queried the live API or fell back
        lastLiveFetchTime = Date.now();
      } else {
        console.log("[Server API] Cache hit. Returning cached World Cup data.");
      }

      res.setHeader("Content-Type", "application/json");
      res.json(data);
    } catch (err: any) {
      console.error("[Server API Error]:", err);
      res.status(500).json({ error: "無法獲取世界盃數據，請稍後再試。" });
    }
  });

  // 2. Integration with Vite (Development vs Production)
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Running in DEVELOPMENT mode. Mounting Vite middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Running in PRODUCTION mode. Serving pre-built static files.");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files
    app.use(express.static(distPath));
    
    // Fallback all other GET calls to single-page app index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Server successfully booted at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server Start Fail]:", err);
});
