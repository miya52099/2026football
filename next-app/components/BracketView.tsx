import React from "react";
import { Trophy, ShieldAlert } from "lucide-react";

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

interface BracketRound {
  round: string;
  matches: Match[];
}

interface BracketViewProps {
  bracket: BracketRound[];
}

export default function BracketView({ bracket }: BracketViewProps) {
  if (!bracket || bracket.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-sans font-medium">
        淘汰賽對陣尚未產生。
      </div>
    );
  }

  const getTeamNameStyle = (score: any, opponentScore: any, isWinner: boolean, teamName: string) => {
    if (teamName.includes("勝方") || teamName.includes("TBD")) {
      return "text-slate-400 italic text-xs";
    }
    if (score === "尚未開始" || score === null) {
      return "text-slate-600 text-sm font-medium";
    }
    return isWinner ? "text-blue-600 font-bold text-sm" : "text-slate-400 text-sm line-through decoration-slate-200";
  };

  const getTeamGradient = (name: string) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "bg-blue-500/20 border-blue-200",
      "bg-emerald-500/20 border-emerald-200",
      "bg-amber-500/20 border-amber-200",
      "bg-rose-500/20 border-rose-200",
      "bg-violet-500/20 border-violet-200",
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
    <div className="w-full flex flex-col">
      <div className="mb-6 p-4 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center gap-3 text-xs md:text-sm text-blue-800">
        <Trophy className="text-yellow-500 shrink-0" size={18} />
        <span className="font-medium">淘汰賽自 32 強賽事啟動，單場勝退制。左右滑動即可觀看後續賽程，冠軍隊伍將誕生於 MetLife 體育場！</span>
      </div>

      <div className="w-full overflow-x-auto pb-6">
        <div className="min-w-[1200px] flex gap-12 px-2 items-stretch pointer-events-auto">
          {bracket.map((roundObj, idx) => {
            const hasMatches = roundObj.matches && roundObj.matches.length > 0;
            const title = translateRoundTitle(roundObj.round);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full py-3 bg-white border border-slate-200 rounded-xl text-center mb-8 shadow-sm">
                  <span className="text-sm font-extrabold text-slate-800 tracking-wider block">
                    {title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">
                    {hasMatches ? `${roundObj.matches.length} 場對陣` : "尚未產生"}
                  </span>
                </div>

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
                            isL ? "ring-1 ring-rose-300 border-rose-300" : ""
                          }`}
                        >
                          <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200/60 text-[10px] text-slate-500 font-medium flex justify-between items-center animate-none">
                            <span className="truncate max-w-[160px]">{m.venue}</span>
                            {isL ? (
                              <span className="text-rose-500 font-extrabold animate-pulse">進行中</span>
                            ) : (
                              <span>{m.localDate.substring(5, 16)}</span>
                            )}
                          </div>

                          <div className="p-3 gap-2 flex items-center justify-between border-b border-slate-100/50 hover:bg-slate-50/50">
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-6 rounded-sm ${getTeamGradient(m.homeTeam)} shrink-0`}></span>
                              <span className={getTeamNameStyle(m.homeScore, m.awayScore, hw, m.homeTeam)}>
                                {m.homeTeam}
                              </span>
                            </div>
                            <span className={`font-mono text-sm tracking-wider font-bold pr-1 ${hw ? "text-blue-600" : m.homeScore === "尚未開始" ? "text-slate-300" : "text-slate-400"}`}>
                              {m.homeScore === "尚未開始" ? "-" : m.homeScore}
                            </span>
                          </div>

                          <div className="p-3 gap-2 flex items-center justify-between hover:bg-slate-50/50">
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-1.5 h-6 rounded-sm ${getTeamGradient(m.awayTeam)} shrink-0`}></span>
                              <span className={getTeamNameStyle(m.awayScore, m.homeScore, aw, m.awayTeam)}>
                                {m.awayTeam}
                              </span>
                            </div>
                            <span className={`font-mono text-sm tracking-wider font-bold pr-1 ${aw ? "text-blue-600" : m.awayScore === "尚未開始" ? "text-slate-300" : "text-slate-400"}`}>
                              {m.awayScore === "尚未開始" ? "-" : m.awayScore}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 text-center border border-dashed border-slate-200 rounded-2xl w-64 text-slate-400 bg-slate-50/30">
                      <ShieldAlert size={28} className="text-slate-300 stroke-1" />
                      <div className="text-xs font-semibold text-slate-450">
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
