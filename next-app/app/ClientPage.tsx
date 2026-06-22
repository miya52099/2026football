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
}

export default function ClientPage() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"schedule" | "standings" | "bracket">("schedule");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Helper date for "Today's Matches" detection (2026-06-20)
  const TODAY_DATE_STR = "2026-06-20";

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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center gap-4 text-center p-6">
        <Loader2 className="animate-spin text-cyan-400 shrink-0" size={48} />
        <div className="space-y-1">
          <p className="text-lg font-bold text-white tracking-widest uppercase">2026 世界盃比分中心</p>
          <p className="text-sm text-slate-400">正在讀取即時賽程與比分數據...</p>
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

  const todaysMatches = matchesPool.filter(
    (m) => m.utcDate.startsWith(TODAY_DATE_STR) || m.localDate.startsWith(TODAY_DATE_STR)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header Banner */}
      <header className="relative w-full overflow-hidden border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5" id="brand-logo">
            <div className="relative p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 rounded-xl shadow-inner border border-cyan-400/30">
              <Trophy className="text-white shrink-0 drop-shadow-md" size={24} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950"></span>
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                2026 世界盃比分中心
              </h1>
              <p className="text-xs text-slate-400">美加墨聯合舉辦 • FIFA World Cup 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              API 快取啟用中
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white transition disabled:opacity-50"
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
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
            <div className="grow">
              <strong>連線錯誤：</strong> {error}
            </div>
            <button
              onClick={() => fetchScoreCenterData()}
              className="px-4 py-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition font-medium self-start md:self-auto"
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

        {/* Search results or tabs */}
        {searchQuery.trim().length > 0 ? (
          <section className="space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                搜尋結果
                <span className="text-sm font-normal text-slate-400">
                  （共找到 {filteredMatches.length} 場）
                </span>
              </h2>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition"
              >
                重設搜尋
              </button>
            </div>

            {filteredMatches.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/10 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400 font-medium">
                <span className="text-4xl text-slate-600">🔍</span>
                <span className="text-sm">找不到相關比賽</span>
                <span className="text-xs text-slate-500 max-w-sm">
                  請確認輸入名稱是否正確（例如輸入「美國」或「澳洲」，或者縮小搜尋條件）。
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((m) => (
                  <MatchCard key={m.id} match={m as any} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-800">
              <button
                onClick={() => setActiveTab("schedule")}
                className={`py-3.5 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 ${
                  activeTab === "schedule"
                    ? "border-cyan-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <CalendarCheck size={18} />
                賽程中心
              </button>
              <button
                onClick={() => setActiveTab("standings")}
                className={`py-3.5 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 ${
                  activeTab === "standings"
                    ? "border-cyan-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Trophy size={18} />
                小組排名
              </button>
              <button
                onClick={() => setActiveTab("bracket")}
                className={`py-3.5 px-6 font-bold text-sm md:text-base border-b-2 transition-all duration-150 flex items-center gap-2.5 ${
                  activeTab === "bracket"
                    ? "border-cyan-500 text-white"
                    : "border-transparent text-slate-400 hover:text-slate-200"
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
                  {todaysMatches.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping shrink-0"></span>
                        <h2 className="text-lg md:text-xl font-black text-white tracking-wide">
                          今日賽程
                        </h2>
                        <span className="text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          {TODAY_DATE_STR}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {todaysMatches.map((m) => (
                          <MatchCard key={m.id} match={m as any} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h2 className="text-lg md:text-xl font-black text-white tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-5 bg-cyan-500 rounded-full"></span>
                      全部賽程
                    </h2>

                    {matchesPool.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        暫無賽程數據
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchesPool.map((m) => (
                          <MatchCard key={m.id} match={m as any} />
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
      <footer className="border-t border-slate-800/40 bg-slate-950/20 py-8 mt-12 text-center text-slate-500 text-xs">
        <p className="max-w-md mx-auto">
          中華民國 115 年 (2026) 國際足協世界盃即時查詢小工具 • API 提供商 <strong>football-data.org</strong> • 支援 15 分鐘極速快取
        </p>
      </footer>
    </div>
  );
}
