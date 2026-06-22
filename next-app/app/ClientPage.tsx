"use client";

import React, { useState, useEffect } from "react";
import { Trophy, CalendarCheck, Loader2, RefreshCw } from "lucide-react";
import SearchBar from "../components/SearchBar";
import MatchCard from "../components/MatchCard";
import StandingsTable from "../components/StandingsTable";
import BracketView from "../components/BracketView";

interface Match {
  id: string;
  group: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null | "尚未開始";
  awayScore: number | null | "尚未開始";
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  utcDate: string;
  localDate: string;
  venue: string;
}

interface TeamStanding {
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

interface GroupStanding {
  group: string;
  teams: TeamStanding[];
}

interface BracketRound {
  round: string;
  matches: Match[];
}

interface WorldCupData {
  matches: Match[];
  standings: GroupStanding[];
  bracket: BracketRound[];
  source?: string;
  isMock?: boolean;
  isFallback?: boolean;
  debug?: any;
}

export default function ClientPage() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"schedule" | "standings" | "bracket">("schedule");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Helper dynamically formatting today's date (YYYY-MM-DD)
  const getTodayDateString = () => {
    try {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return "2026-06-22";
    }
  };

  const todayStr = getTodayDateString();

  const fetchScoreCenterData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/worldcup");
      if (!response.ok) {
        throw new Error(`無法解析伺服器狀態碼：${response.status}`);
      }
      const json: WorldCupData = await response.json();
      setData(json);
    } catch (err: any) {
      console.error("[FetchError]:", err);
      setError(err.message || "讀取世界盃資料失敗，請確認網路連線。");
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
      <div className="min-h-screen bg-slate-50 text-slate-850 flex flex-col items-center justify-center gap-4 text-center p-6 font-sans">
        <Loader2 className="animate-spin text-blue-600 shrink-0" size={48} />
        <div className="space-y-1">
          <p className="text-lg font-bold text-slate-900 tracking-wider">2026 世界盃比分中心</p>
          <p className="text-sm text-slate-500">正在讀取即時賽程與比分數據...</p>
        </div>
      </div>
    );
  }

  const getFilteredMatches = (matches: Match[]): Match[] => {
    if (!searchQuery.trim()) return matches;
    const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    
    return matches.filter((m) => {
      return terms.every((term) => {
        return (
          m.homeTeam.toLowerCase().includes(term) ||
          m.awayTeam.toLowerCase().includes(term) ||
          m.group.toLowerCase().includes(term) ||
          m.stage.toLowerCase().includes(term) ||
          m.venue.toLowerCase().includes(term)
        );
      });
    });
  };

  const matchesPool = data?.matches || [];
  const filteredMatches = getFilteredMatches(matchesPool);

  // Apply strict rules: if mock, todaysMatches is always empty. Otherwise true today's date matches.
  const isMockData = data?.isMock || false;
  const todaysMatches = isMockData
    ? []
    : matchesPool.filter(
        (m) => m.utcDate.startsWith(todayStr) || m.localDate.startsWith(todayStr)
      );

  const getSourceBadge = () => {
    if (data?.source === "fifa.com" && !data?.isFallback) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-semibold shadow-inner">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          目前使用 FIFA 官方資料
        </span>
      );
    } else if (data?.source === "local-fixtures") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20 font-semibold shadow-inner">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
          目前使用本地賽程資料，比分可能不是即時
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20 font-semibold shadow-inner">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
          目前使用測試資料，非即時比分
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header Banner - Navy styled slate-900 */}
      <header className="relative w-full border-b border-slate-200 bg-slate-900 text-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5" id="brand-logo">
            <div className="relative p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-inner border border-blue-400/30">
              <Trophy className="text-white shrink-0 drop-shadow-md" size={24} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900"></span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                2026 世界盃比分中心
              </h1>
              <p className="text-xs text-slate-300 font-medium">美加墨聯合舉辦 • FIFA World Cup 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getSourceBadge()}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white transition disabled:opacity-50"
              title="重新同步 API 數據"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm font-medium">
            <div className="grow">
              <strong>連線錯誤：</strong> {error}
            </div>
            <button
              onClick={() => fetchScoreCenterData()}
              className="px-4 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition font-semibold self-start md:self-auto shadow-sm"
            >
              重新重試
            </button>
          </div>
        )}

        {/* Search */}
        <section className="space-y-4">
          <SearchBar
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              if (val) setActiveTab("schedule");
            }}
            onClear={() => setSearchQuery("")}
          />
        </section>

        {/* Warn banner if using mock data */}
        {isMockData && (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs md:text-sm font-semibold flex items-center gap-2.5 shadow-sm">
            <span className="text-lg leading-none">📢</span>
            <span>以下為測試資料，正式比分以 FIFA 官方同步為準</span>
          </div>
        )}

        {/* Search results or tabs */}
        {searchQuery.trim().length > 0 ? (
          <section className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                搜尋結果
                <span className="text-sm font-semibold text-slate-500">
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
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-500 font-medium shadow-sm">
                <span className="text-4xl text-slate-400">🔍</span>
                <span className="text-sm font-semibold">找不到相關比賽</span>
                <span className="text-xs text-slate-400 max-w-sm">
                  請確認輸入名稱是否正確（例如輸入「美國」或「澳洲」，或者縮小搜尋條件）。
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((m) => (
                  <MatchCard 
                    key={m.id} 
                    match={m as any} 
                    isMockUserFeedback={data?.isMock}
                    isFallbackUserFeedback={data?.isFallback}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-200" id="next-tabs-nav">
              <button
                onClick={() => setActiveTab("schedule")}
                className={`py-3.5 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 ${
                  activeTab === "schedule"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-850"
                }`}
              >
                <CalendarCheck size={18} />
                賽程中心
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`py-3.5 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 ${
                  activeTab === "standings"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-850"
                }`}
              >
                <Trophy size={18} />
                小組排名
              </button>
              <button
                onClick={() => setActiveTab("bracket")}
                className={`py-3.5 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 ${
                  activeTab === "bracket"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-850"
                }`}
              >
                <span className="inline-block w-4.5 h-4.5 border-2 border-current rounded-sm rotate-45 shrink-0 flex items-center justify-center text-xs font-mono font-bold">T</span>
                淘汰賽樹狀圖
              </button>
            </div>

            {/* Tab panels */}
            <div className="mt-2 transition-opacity duration-300">
              {activeTab === "schedule" && (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0"></span>
                      <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-wide">
                        今日賽程
                      </h2>
                      <span className="text-xs text-slate-500 font-semibold bg-slate-200/60 px-2.5 py-0.5 rounded-full border border-slate-200/80">
                        {todayStr}
                      </span>
                    </div>
                    
                    {todaysMatches.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todaysMatches.map((m) => (
                          <MatchCard 
                            key={m.id} 
                            match={m as any} 
                            isMockUserFeedback={data?.isMock}
                            isFallbackUserFeedback={data?.isFallback}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-100/50 rounded-2xl border border-slate-200/60 text-slate-500 text-sm font-semibold">
                        今日暫無官方賽程資料
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-lg md:text-xl font-black text-slate-800 tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                      全部賽程
                    </h2>

                    {matchesPool.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-semibold text-sm">
                        暫無賽程數據
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchesPool.map((m) => (
                          <MatchCard 
                            key={m.id} 
                            match={m as any} 
                            isMockUserFeedback={data?.isMock}
                            isFallbackUserFeedback={data?.isFallback}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "standings" && data && (
                <div>
                  <StandingsTable standings={data.standings as any} />
                </div>
              )}

              {activeTab === "bracket" && data && (
                <div>
                  <BracketView bracket={data.bracket as any} />
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-100/50 py-8 mt-12 text-center text-slate-500 text-xs font-semibold">
        <p className="max-w-md mx-auto">
          中華民國 115 年 (2026) 國際足協世界盃即時查詢小工具 • 資料來源：fifa.com / local-fixtures / mock-worldcup.json
        </p>
      </footer>
    </div>
  );
}
