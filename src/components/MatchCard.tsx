import React from "react";
import { Calendar, MapPin, Radio } from "lucide-react";
import { Match } from "../types";

interface MatchCardProps {
  key?: string;
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isScheduled = match.status === "SCHEDULED";

  // Status badge styling helper
  const getStatusBadge = () => {
    switch (match.status) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
            進行中
          </span>
        );
      case "FINISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 border border-green-200">
            已結束
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            未開始
          </span>
        );
    }
  };

  // Team avatar colors helper to give the UI visual character and distinctiveness
  const getTeamGradient = (name: string) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-blue-600 to-blue-700",
      "from-emerald-600 to-emerald-700",
      "from-amber-600 to-amber-700",
      "from-rose-600 to-rose-700",
      "from-violet-600 to-violet-700",
      "from-cyan-600 to-blue-600",
    ];
    return colors[sum % colors.length];
  };

  return (
    <div
      id={`match-${match.id}`}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        isLive
          ? "bg-white border-blue-500 shadow-md scale-[1.01] ring-1 ring-blue-500/30"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md shadow-sm"
      }`}
    >
      {/* Decorative vertical light strip for Live match */}
      {isLive && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-blue-600"></div>
      )}

      {/* Card Header information */}
      <div className="px-5 pt-4 pb-2 flex justify-between items-center text-xs text-slate-400 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">{match.group}</span>
          <span className="text-slate-300 font-medium">•</span>
          <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">{match.stage}</span>
        </div>
        {getStatusBadge()}
      </div>

      {/* Match Competitors Content */}
      <div className="px-5 py-6 flex flex-col items-center justify-center gap-4">
        <div className="w-full grid grid-cols-7 items-center text-center">
          {/* Home Team */}
          <div className="col-span-3 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(match.homeTeam)} flex items-center justify-center text-white font-black text-sm shadow-sm ring-4 ring-slate-50`}>
              {match.homeTeam.substring(0, 2)}
            </div>
            <span className="font-bold text-slate-800 truncate max-w-full text-sm md:text-base">{match.homeTeam}</span>
          </div>

          {/* Scores or Status Visual */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {isScheduled ? (
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider py-1 select-none">VS</span>
            ) : (
              <div className="flex items-center gap-1.5 text-2xl md:text-3xl font-black text-slate-800 tracking-tight tabular-nums">
                <span className={isLive ? "text-blue-600 font-black" : "text-slate-800"}>
                  {match.homeScore}
                </span>
                <span className="text-slate-300 text-lg font-bold">-</span>
                <span className={isLive ? "text-blue-600 font-black" : "text-slate-800"}>
                  {match.awayScore}
                </span>
              </div>
            )}
            
            {isScheduled && (
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full mt-1 font-semibold whitespace-nowrap">
                未開始
              </span>
            )}
          </div>

          {/* Away Team */}
          <div className="col-span-3 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(match.awayTeam)} flex items-center justify-center text-white font-black text-sm shadow-sm ring-4 ring-slate-50`}>
              {match.awayTeam.substring(0, 2)}
            </div>
            <span className="font-bold text-slate-800 truncate max-w-full text-sm md:text-base">{match.awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Card Footer Details */}
      <div className="px-5 pb-4 pt-2 flex flex-col gap-1 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar size={13} className="text-slate-400" />
          <span>時間：{match.localDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 truncate">
          <MapPin size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
      </div>
    </div>
  );
}
