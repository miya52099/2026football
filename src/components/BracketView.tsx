import React from "react";
import { Trophy, ShieldAlert, Award } from "lucide-react";
import { BracketRound, Match } from "../types";

interface BracketViewProps {
  bracket: BracketRound[];
}

export default function BracketView({ bracket }: BracketViewProps) {
  if (!bracket || bracket.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-700/50 text-slate-400 font-sans">
        淘汰賽對陣尚未產生。
      </div>
    );
  }

  // Bracket team style
  const formatTeamNameDisplay = (name: string): string => {
    if (!name) return "待定晉級隊伍";
    let formatted = name;
    
    // Replace b32-* with 32 強勝方
    if (formatted.includes("b32")) {
      const match = formatted.match(/\d+/);
      const suffix = match ? ` (${match[0]})` : "";
      return `32 強勝方${suffix}`;
    }
    // Replace b16-* with 16 強勝方
    if (formatted.includes("b16")) {
      const match = formatted.match(/\d+/);
      const suffix = match ? ` (${match[0]})` : "";
      return `16 強勝方${suffix}`;
    }
    // Replace qf-* with 8 強勝方 (準決賽對手)
    if (formatted.includes("qf")) {
      const match = formatted.match(/\d+/);
      const suffix = match ? ` (${match[0]})` : "";
      return `8 強勝方${suffix}`;
    }
    // Replace sf-* with 準決賽勝方
    if (formatted.includes("sf")) {
      const match = formatted.match(/\d+/);
      const suffix = match ? ` (${match[0]})` : "";
      return `準決賽勝方${suffix}`;
    }
    // TBD / Undetermined
    if (
      formatted === "TBD" || 
      formatted.toLowerCase() === "tbd" || 
      formatted.includes("勝方 (")
    ) {
      return "待定晉級隊伍";
    }
    return formatted;
  };

  const getTeamNameStyle = (score: any, opponentScore: any, isWinner: boolean, teamName: string) => {
    const isTbd = 
      teamName.includes("b32") || 
      teamName.includes("b16") || 
      teamName.includes("qf") || 
      teamName.includes("sf") || 
      teamName.includes("f-") || 
      teamName.includes("勝方") || 
      teamName.toLowerCase() === "tbd" || 
      teamName === "待定晉級隊伍" || 
      teamName === "未知隊伍";

    if (isTbd) {
      return "text-slate-400 italic text-xs font-normal";
    }
    if (score === "尚未開始" || score === null) {
      return "text-slate-700 text-sm font-semibold";
    }
    return isWinner ? "text-blue-600 font-extrabold text-sm" : "text-slate-400 text-sm line-through decoration-slate-200";
  };

  const getTeamGradient = (name: string) => {
    // Generate simple seed for stable colors based on team letters
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-blue-100 border-blue-300",
      "bg-emerald-100 border-emerald-300",
      "bg-amber-100 border-amber-300",
      "bg-rose-100 border-rose-300",
      "bg-violet-100 border-violet-300",
    ];
    return colors[sum % colors.length];
  };

  const isHomeWinner = (m: Match) => {
    if (m.homeScore === "尚未開始" || m.awayScore === "尚未開始" || m.homeScore === null || m.awayScore === null) return false;
    return (m.homeScore as number) > (m.awayScore as number);
  };

  const isAwayWinner = (m: Match) => {
    if (m.homeScore === "尚未開始" || m.awayScore === "尚未開始" || m.homeScore === null || m.awayScore === null) return false;
    return (m.awayScore as number) > (m.homeScore as number);
  };

  // Convert round standard naming to Traditional Chinese
  const translateRoundTitle = (r: string) => {
    switch (r) {
      case "Round of 32":
        return "32 強淘汰賽";
      case "Round of 16":
        return "16 強淘汰賽";
      case "Quarter-finals":
        return "半準決賽 (8強)";
      case "Semi-finals":
        return "準決賽 (4強)";
      case "Final":
        return "世界大賽 (決賽)";
      default:
        return r;
    }
  };

  return (
    <div className="w-full flex flex-col" id="bracket-root">
      {/* Help Banner */}
      <div className="mb-6 p-4 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center gap-3 text-xs md:text-sm text-slate-600" id="bracket-banner">
        <Trophy className="text-blue-600 shrink-0" size={18} />
        <span>淘汰賽自 32 強賽事啟動，單場勝退制。左右滑動即可觀看後續賽程，冠軍隊伍將誕生於 MetLife 體育場！</span>
      </div>

      {/* Bracket Scrolling Container */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-slate-50" id="bracket-scroller">
        <div className="min-w-[1200px] flex gap-12 px-2 items-stretch pointer-events-auto">
          {bracket.map((roundObj, idx) => {
            const hasMatches = roundObj.matches && roundObj.matches.length > 0;
            const title = translateRoundTitle(roundObj.round);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center"
                id={`bracket-round-${idx}`}
              >
                {/* Round Header */}
                <div className="w-full py-3 bg-white border border-slate-200 rounded-xl text-center mb-8 shadow-sm">
                  <span className="text-sm font-extrabold text-slate-800 tracking-wider block">
                    {title}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {hasMatches ? `${roundObj.matches.length} 場對陣` : "尚未產生"}
                  </span>
                </div>

                {/* Round matches nodes tree container */}
                <div className="flex-1 flex flex-col justify-around gap-6">
                  {hasMatches ? (
                    roundObj.matches.map((m, mIdx) => {
                      const hw = isHomeWinner(m);
                      const aw = isAwayWinner(m);
                      const isL = m.status === "LIVE";

                      return (
                        <div
                          key={mIdx}
                          className={`w-64 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 hover:shadow-md transition-all ${
                            isL ? "ring-1 ring-blue-500/40 border-blue-500" : ""
                          }`}
                        >
                          {/* Match Mini Date Header */}
                          <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 flex justify-between items-center">
                            <span className="truncate max-w-[160px]">{m.venue}</span>
                            {isL ? (
                              <span className="text-red-500 font-extrabold animate-pulse">進行中</span>
                            ) : (
                              <span>{m.localDate.substring(5, 16)}</span>
                            )}
                          </div>

                          {/* Home team row */}
                          <div className="p-3 gap-2 flex items-center justify-between border-b border-slate-100 hover:bg-slate-50/50">
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-6 rounded-sm ${getTeamGradient(m.homeTeam)} shrink-0`}></span>
                              <span className={getTeamNameStyle(m.homeScore, m.awayScore, hw, m.homeTeam)}>
                                {formatTeamNameDisplay(m.homeTeam)}
                              </span>
                            </div>
                            <span className={`font-mono text-sm tracking-widest font-extrabold pr-1 ${hw ? "text-blue-600" : m.homeScore === "尚未開始" ? "text-slate-300" : "text-slate-500"}`}>
                              {m.homeScore === "尚未開始" ? "-" : m.homeScore}
                            </span>
                          </div>

                          {/* Away team row */}
                          <div className="p-3 gap-2 flex items-center justify-between hover:bg-slate-50/50">
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-6 rounded-sm ${getTeamGradient(m.awayTeam)} shrink-0`}></span>
                              <span className={getTeamNameStyle(m.awayScore, m.homeScore, aw, m.awayTeam)}>
                                {formatTeamNameDisplay(m.awayTeam)}
                              </span>
                            </div>
                            <span className={`font-mono text-sm tracking-widest font-extrabold pr-1 ${aw ? "text-blue-600" : m.awayScore === "尚未開始" ? "text-slate-300" : "text-slate-500"}`}>
                              {m.awayScore === "尚未開始" ? "-" : m.awayScore}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Placeholder blocks to structure the tree
                    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 text-center border border-dashed border-slate-200 bg-white rounded-2xl w-64 text-slate-400">
                      <ShieldAlert size={28} className="text-slate-300 stroke-1" />
                      <div className="text-xs">
                        <span>小組賽程結束後</span>
                        <br />
                        <span>即時產生對抗組合</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
