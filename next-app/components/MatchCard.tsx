import React from "react";
import { Calendar, MapPin } from "lucide-react";

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

interface MatchCardProps {
  key?: string;
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isScheduled = match.status === "SCHEDULED";

  const getStatusBadge = () => {
    switch (match.status) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            進行中
          </span>
        );
      case "FINISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            已結束
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            未開始
          </span>
        );
    }
  };

  const getTeamGradient = (name: string) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-blue-600 to-indigo-600",
      "from-emerald-600 to-teal-600",
      "from-amber-600 to-orange-600",
      "from-rose-600 to-pink-600",
      "from-violet-600 to-fuchsia-600",
      "from-cyan-600 to-blue-500",
    ];
    return colors[sum % colors.length];
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isLive
          ? "bg-slate-800/90 border-rose-500/40 shadow-rose-900/10 shadow-lg scale-[1.01] ring-1 ring-rose-500/30"
          : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600 shadow-md"
      }`}
    >
      {isLive && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-orange-500"></div>
      )}

      <div className="px-5 pt-4 pb-2 flex justify-between items-center text-xs text-slate-400 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 font-medium">{match.group}</span>
          <span className="text-slate-500 font-medium">•</span>
          <span className="text-slate-300">{match.stage}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="px-5 py-6 flex flex-col items-center justify-center gap-4">
        <div className="w-full grid grid-cols-7 items-center text-center">
          <div className="col-span-3 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(match.homeTeam)} flex items-center justify-center text-white font-bold text-lg shadow-inner ring-4 ring-slate-800/40`}>
              {match.homeTeam.substring(0, 2)}
            </div>
            <span className="font-semibold text-white truncate max-w-full text-sm md:text-base">{match.homeTeam}</span>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center">
            {isScheduled ? (
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider py-1">VS</span>
            ) : (
              <div className="flex items-center gap-1.5 text-2xl md:text-3xl font-extrabold text-white tracking-widest tabular-nums font-mono">
                <span>{match.homeScore}</span>
                <span className="text-slate-600 text-lg">-</span>
                <span>{match.awayScore}</span>
              </div>
            )}
            {isScheduled && (
              <span className="text-[10px] text-slate-400 bg-slate-700/40 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap">
                尚未開始
              </span>
            )}
          </div>

          <div className="col-span-3 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(match.awayTeam)} flex items-center justify-center text-white font-bold text-lg shadow-inner ring-4 ring-slate-800/40`}>
              {match.awayTeam.substring(0, 2)}
            </div>
            <span className="font-semibold text-white truncate max-w-full text-sm md:text-base">{match.awayTeam}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 pt-2 flex flex-col gap-1 text-xs text-slate-400 border-t border-slate-700/20">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Calendar size={13} className="text-slate-500" />
          <span>當地時間：{match.localDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 truncate">
          <MapPin size={13} className="text-slate-500 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
      </div>
    </div>
  );
}
