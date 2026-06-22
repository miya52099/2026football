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
  isMockUserFeedback?: boolean;
  isFallbackUserFeedback?: boolean;
}

export default function MatchCard({ match, isMockUserFeedback, isFallbackUserFeedback }: MatchCardProps) {
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const isScheduled = match.status === "SCHEDULED";

  const getStatusBadge = () => {
    if (match.status === "LIVE") {
      if (isMockUserFeedback) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-50 text-amber-600 border border-amber-200/60">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
            測試資料
          </span>
        );
      } else if (isFallbackUserFeedback) {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-50 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
            待官方同步
          </span>
        );
      } else {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-50 text-rose-600 border border-rose-200/50 animate-pulse">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            進行中
          </span>
        );
      }
    } else if (match.status === "FINISHED") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
          已結束
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
          未開始
        </span>
      );
    }
  };

  const getTeamGradient = (name: string) => {
    const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      "from-blue-500 to-indigo-600",
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600",
      "from-violet-500 to-fuchsia-600",
      "from-cyan-500 to-blue-500",
    ];
    return colors[sum % colors.length];
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 bg-white ${
        isLive
          ? "border-rose-300 shadow-rose-100 shadow-lg scale-[1.01] ring-1 ring-rose-300/40"
          : "border-slate-200 hover:border-slate-300/80 hover:shadow-lg shadow-sm"
      }`}
    >
      {isLive && (
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-rose-500 to-orange-500"></div>
      )}

      <div className="px-5 pt-4 pb-2.5 flex justify-between items-center text-xs text-slate-500 border-b border-slate-100/80 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-slate-200/60 text-slate-700 font-semibold text-[11px]">{match.group}</span>
          <span className="text-slate-300 font-medium">•</span>
          <span className="text-slate-600 font-medium">{match.stage}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="px-5 py-6 flex flex-col items-center justify-center gap-4">
        <div className="w-full grid grid-cols-7 items-center text-center">
          <div className="col-span-3 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(match.homeTeam)} flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-slate-100`}>
              {match.homeTeam.substring(0, 2)}
            </div>
            <span className="font-bold text-slate-800 truncate max-w-full text-sm md:text-base">{match.homeTeam}</span>
          </div>

          <div className="col-span-1 flex flex-col items-center justify-center">
            {isScheduled ? (
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider py-1">VS</span>
            ) : (
              <div className="flex items-center gap-1 text-2xl md:text-3xl font-black text-slate-900 tracking-tight tabular-nums font-mono">
                <span>{match.homeScore}</span>
                <span className="text-slate-300 text-lg font-light">-</span>
                <span>{match.awayScore}</span>
              </div>
            )}
            {isScheduled && (
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full mt-1 font-medium whitespace-nowrap">
                尚未開始
              </span>
            )}
          </div>

          <div className="col-span-3 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTeamGradient(match.awayTeam)} flex items-center justify-center text-white font-bold text-base shadow-sm ring-2 ring-slate-100`}>
              {match.awayTeam.substring(0, 2)}
            </div>
            <span className="font-bold text-slate-800 truncate max-w-full text-sm md:text-base">{match.awayTeam}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4 pt-2.5 flex flex-col gap-1.5 text-xs text-slate-500 border-t border-slate-100 bg-slate-50/20">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Calendar size={13} className="text-slate-400 shrink-0" />
          <span>當地時間：{match.localDate}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500 truncate">
          <MapPin size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
      </div>
    </div>
  );
}
