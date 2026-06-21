import React, { useState, useEffect } from "react";
import { Trophy, CalendarCheck, Loader2, RefreshCw, RefreshCw as ResetIcon } from "lucide-react";
import { WorldCupData, Match } from "./types";
import SearchBar from "./components/SearchBar";
import MatchCard from "./components/MatchCard";
import StandingsTable from "./components/StandingsTable";
import BracketView from "./components/BracketView";

export default function App() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"schedule" | "standings" | "bracket">("schedule");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [allMatchesLimit, setAllMatchesLimit] = useState<number>(10);

  // Helper date for "Today's Matches" detection (matches current local date in metadata 2026-06-20)
  const TODAY_DATE_STR = "2026-06-20";

  const fetchScoreCenterData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/worldcup${silent ? "?refresh=true" : ""}`);
      if (!response.ok) {
        throw new Error(`無法解析伺服器狀態碼：${response.status}`);
      }
      const json: WorldCupData = await response.json();
      setData(json);
    } catch (err: any) {
      console.error("[FetchError]:", err);
      setError(err.message || "讀取世界盃資料失敗，請確認網路連線或 API Key。");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchScoreCenterData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchScoreCenterData(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Header Banner */}
        <header className="relative w-full overflow-hidden border-b border-slate-800/10 bg-[#0f172a] text-white py-5 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo Brand Title */}
            <div className="flex items-center gap-3.5">
              <div className="relative p-2.5 bg-blue-600 rounded-xl shadow-sm border border-blue-500">
                <Trophy className="text-white shrink-0 drop-[#0f172a]" size={24} />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">2026 世界盃比分直播 center</h1>
                <p className="text-xs text-slate-400 font-medium">美加墨聯合舉辦 • FIFA World Cup 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs border border-slate-700 font-mono">
                <Loader2 size={12} className="animate-spin text-blue-500" />正在載入資料...
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Skeleton SearchBar */}
          <div className="w-full max-w-2xl mx-auto space-y-4 animate-pulse">
            <div className="w-full h-12 bg-white border border-slate-200/60 rounded-xl"></div>
            <div className="flex gap-2 items-center pl-1">
              <div className="h-4 w-16 bg-slate-200 rounded"></div>
              <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-16 bg-slate-200 rounded-full"></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-6 w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                    <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
                    <div className="h-3.5 w-12 bg-slate-200 rounded"></div>
                  </div>
                  <div className="grid grid-cols-7 items-center gap-2">
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                      <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
                    </div>
                    <div className="col-span-1 flex flex-col items-center justify-center">
                      <div className="h-3 w-6 bg-slate-150 rounded"></div>
                    </div>
                    <div className="col-span-3 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-200"></div>
                      <div className="h-3.5 w-16 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-50 space-y-2">
                    <div className="h-3 w-28 bg-slate-100 rounded"></div>
                    <div className="h-3 w-36 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Filter Match results based on smart queries
  const getFilteredMatches = (matches: Match[]): Match[] => {
    if (!searchQuery.trim()) return matches;
    const formatSearchTerm = (str: string) => {
      return str.toLowerCase().replace(/\s+/g, "").trim();
    };

    const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    return matches.filter((m) => {
      const normalizedHome = formatSearchTerm(m.homeTeam);
      const normalizedAway = formatSearchTerm(m.awayTeam);
      const normalizedGroup = formatSearchTerm(m.group);
      const normalizedStage = formatSearchTerm(m.stage);
      const normalizedVenue = formatSearchTerm(m.venue);

      return terms.every((rawTerm) => {
        const term = formatSearchTerm(rawTerm);
        return (
          normalizedHome.includes(term) ||
          normalizedAway.includes(term) ||
          normalizedGroup.includes(term) ||
          normalizedStage.includes(term) ||
          normalizedVenue.includes(term)
        );
      });
    });
  };

  const matchesPool = data?.matches || [];
  const filteredMatches = getFilteredMatches(matchesPool);

  // Get today's local date string (e.g. "2026-06-20")
  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTodayDateStrRef = (): string => {
    const actualToday = getTodayDateString();
    const hasActualTodayMatches = matchesPool.some(
      (m) => m.utcDate.startsWith(actualToday) || m.localDate.startsWith(actualToday)
    );
    if (hasActualTodayMatches) {
      return actualToday;
    }
    const hasMockTodayMatches = matchesPool.some(
      (m) => m.utcDate.startsWith(TODAY_DATE_STR) || m.localDate.startsWith(TODAY_DATE_STR)
    );
    if (hasMockTodayMatches) {
      return TODAY_DATE_STR;
    }
    return actualToday;
  };

  const todayDateStr = getTodayDateStrRef();

  // Divide into Today's vs All (only inside no-search schedule scope)
  const todaysMatches = matchesPool.filter(
    (m) => m.utcDate.startsWith(todayDateStr) || m.localDate.startsWith(todayDateStr)
  );

  // Filter out todaysMatches from allMatches to avoid duplication
  const allMatchesExcludingToday = matchesPool.filter(
    (m) => !todaysMatches.some((tm) => tm.id === m.id)
  );

  const displayedAllMatches = allMatchesExcludingToday.slice(0, allMatchesLimit);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/20 selection:text-blue-900 overflow-x-hidden">
      
      {/* 1. Header Banner */}
      <header className="relative w-full overflow-hidden border-b border-slate-800/10 bg-[#0f172a] text-white py-5 sticky top-0 z-40 shadow-md animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3.5" id="brand-logo">
            <div className="relative p-2.5 bg-blue-600 rounded-xl shadow-sm border border-blue-500">
              <Trophy className="text-white shrink-0 drop-shadow-md" size={24} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-[#0f172a]"></span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                2026 世界盃比分直播中心
              </h1>
              <p className="text-xs text-slate-400 font-medium">美加墨聯合舉辦 • FIFA World Cup 2026</p>
            </div>
          </div>

          {/* Dynamic Sync Status bar with data source badges & last updated indicator */}
          <div className="flex flex-col sm:items-end gap-1.5" id="brand-sync">
            <div className="flex items-center gap-2">
              {data?.dataSource === "api" || data?.source === "api" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-semibold shadow-sm animate-fade-in">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  資料來源：football-data.org
                </span>
              ) : data?.dataSource === "fallback" || data?.source === "fallback" || data?.isFallback ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs border border-amber-500/30 font-semibold shadow-sm animate-pulse">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  API 暫時無法連線，已切換為備援資料
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 text-xs border border-blue-500/35 font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  目前使用測試資料
                </span>
              )}

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                id="refresh-button"
                className="p-2 ml-1 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
                title="重新同步 API 數據"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            
            {data?.lastUpdated && (
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                最後更新時間：{data.lastUpdated}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm shadow-sm animate-fade-in" id="error-alert">
            <div className="grow">
              <strong>連線發生錯誤：</strong> {error}
            </div>
            <button
              onClick={() => fetchScoreCenterData()}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-semibold self-start md:self-auto shadow-sm"
            >
              重新重試
            </button>
          </div>
        )}

        {/* 2. Unified Search Module */}
        <section id="search-section" className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              // Shift immediately to schedule tab to view results
              if (val) setActiveTab("schedule");
            }}
            onClear={() => setSearchQuery("")}
          />
        </section>

        {/* 3. Search Results Overlay (If query length > 0) */}
        {searchQuery.trim().length > 0 ? (
          <section id="search-results-section" className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200" id="search-title">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2 animate-fade-in">
                搜尋結果
                <span className="text-sm font-normal text-slate-500">
                  （共找到 {filteredMatches.length} 場）
                </span>
              </h2>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold transition"
              >
                重設搜尋
              </button>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium shadow-sm animate-fade-in" id="no-matches-view">
                <span className="text-4xl text-slate-300">🔍</span>
                <span className="text-base text-slate-700 font-bold">找不到相關比賽，請嘗試輸入隊伍名稱或組別</span>
                <span className="text-xs text-slate-450 max-w-sm">
                  例如輸入單個國家（「美國」）、雙個國家組合（「美國 澳洲」）、組別名稱（「A 組」），或者階段名稱。
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in" id="search-results-grid">
                {filteredMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* 4. Main Tabbed Layout (If not searching) */
          <>
            {/* Tab Swappers - optimized with overflow-x-auto for smooth mobile horizontal scrolling without wrapping */}
            <div className="flex overflow-x-auto border border-slate-200 bg-white rounded-xl shadow-sm mb-6 scrollbar-none whitespace-nowrap" id="navigation-tabs">
              <button
                id="tab-schedule-selector"
                onClick={() => setActiveTab("schedule")}
                className={`py-4 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 shrink-0 ${
                  activeTab === "schedule"
                    ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40"
                }`}
              >
                <CalendarCheck size={18} />
                賽程中心
              </button>
              <button
                id="tab-standings-selector"
                onClick={() => setActiveTab("standings")}
                className={`py-4 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 shrink-0 ${
                  activeTab === "standings"
                    ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40"
                }`}
              >
                <Trophy size={18} />
                小組排名
              </button>
              <button
                id="tab-bracket-selector"
                onClick={() => setActiveTab("bracket")}
                className={`py-4 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 shrink-0 ${
                  activeTab === "bracket"
                    ? "border-blue-600 text-blue-600 font-extrabold bg-blue-50/10"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/40"
                }`}
              >
                <span className="inline-block w-4.5 h-4.5 border-2 border-current rounded-sm rotate-45 shrink-0 flex items-center justify-center text-xs">T</span>
                淘汰賽樹狀圖
              </button>
            </div>

            {/* Tab Panel Views */}
            <div className="mt-2 transition-opacity duration-300" id="main-tab-content">
              
              {/* SCHEDULE TAB PANEL */}
              {activeTab === "schedule" && (
                <div className="space-y-10 animate-fade-in" id="schedule-panel">
                  
                  {/* Today's matches Section (Only shows today's match list) */}
                  {todaysMatches.length > 0 && (
                    <div className="space-y-4" id="todays-matches-wrapper">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping shrink-0"></span>
                        <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-wide">
                          今日賽程
                        </h2>
                        <span className="text-xs text-red-600 font-bold bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                          {todayDateStr}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="todays-matches-grid">
                        {todaysMatches.map((m) => (
                          <MatchCard key={m.id} match={m} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Matches Section */}
                  <div className="space-y-4" id="all-matches-wrapper">
                    <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                      全部賽程
                    </h2>

                    {allMatchesExcludingToday.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-slate-100 shadow-sm">
                        暫無其他賽程數據
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="all-matches-grid">
                          {displayedAllMatches.map((m) => (
                            <MatchCard key={m.id} match={m} />
                          ))}
                        </div>

                        {/* Load More Matches Control Selector */}
                        {allMatchesExcludingToday.length > allMatchesLimit && (
                          <div className="flex flex-col items-center gap-2 pt-6" id="load-more-container">
                            <button
                              id="load-more-matches-button"
                              onClick={() => setAllMatchesLimit((prev) => prev + 10)}
                              className="px-6 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold text-sm rounded-xl shadow-sm transition flex items-center gap-2 active:scale-95"
                            >
                              <span>查看更多賽程 (+10)</span>
                            </button>
                            <span className="text-xs text-slate-400 font-mono">
                              目前顯示 {displayedAllMatches.length} / {allMatchesExcludingToday.length} 場賽程
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </div>
              )}

              {/* STANDINGS TAB PANEL */}
              {activeTab === "standings" && data && (
                <div id="standings-panel" className="w-full">
                  <StandingsTable standings={data.standings} />
                </div>
              )}

              {/* BRACKET TAB PANEL */}
              {activeTab === "bracket" && data && (
                <div id="bracket-panel" className="w-full">
                  <BracketView bracket={data.bracket} />
                </div>
              )}

            </div>
          </>
        )}

      </main>

      {/* Humble Footer */}
      <footer className="border-t border-slate-200 bg-slate-100/60 py-8 mt-16 text-center text-slate-500 text-xs text-balance" id="scorecenter-footer">
        <p className="max-w-md mx-auto leading-relaxed">
          中華民國 115 年 (2026) 國際足協世界盃即時查詢小工具 • API 提供商 <strong>football-data.org</strong> • 支援 15 分鐘極速快取
        </p>
      </footer>
    </div>
  );
}
