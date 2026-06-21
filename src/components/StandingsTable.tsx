import React from "react";
import { GroupStanding } from "../types";

interface StandingsTableProps {
  standings: GroupStanding[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-700/50 text-slate-400 font-sans">
        歷史上或目前沒有可顯示的小組排名數據。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="standings-grid">
      {standings.map((groupStanding, index) => (
        <div
          key={index}
          id={`group-standing-${groupStanding.group.replace(/\s+/g, "")}`}
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col"
        >
          {/* Group Header */}
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
            {groupStanding.group}
          </h3>

          {/* Standings Table container with mobile swiping fallback */}
          <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400 font-semibold tracking-wider">
                  <th className="py-2.5 w-10 text-center">#</th>
                  <th className="py-2.5">國家隊伍</th>
                  <th className="py-2.5 text-center w-10">已賽</th>
                  <th className="py-2.5 text-center w-8">勝</th>
                  <th className="py-2.5 text-center w-8">和</th>
                  <th className="py-2.5 text-center w-8">負</th>
                  <th className="py-2.5 text-center w-12">得/失</th>
                  <th className="py-2.5 text-center w-10">球差</th>
                  <th className="py-2.5 text-right pr-2 w-12">積分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {groupStanding.teams.map((teamRow, idx) => {
                  const rank = idx + 1;
                  // First two qualify
                  const isTopTwo = rank <= 2;

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-slate-50 transition-all duration-150 ${isTopTwo ? "bg-blue-50/10" : ""}`}
                    >
                      {/* Rank Position */}
                      <td className="py-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                            isTopTwo
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "text-slate-400 bg-slate-50"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      {/* Team Name */}
                      <td className="py-3 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isTopTwo ? "bg-blue-500" : "bg-slate-300"}`}></span>
                          {teamRow.team}
                        </div>
                      </td>

                      {/* Played Games */}
                      <td className="py-3 text-center text-slate-600 tabular-nums">{teamRow.played}</td>
                      
                      {/* Wins */}
                      <td className="py-3 text-center text-emerald-600 font-medium tabular-nums">{teamRow.won}</td>
                      
                      {/* Draws */}
                      <td className="py-3 text-center text-slate-500 tabular-nums">{teamRow.draw}</td>
                      
                      {/* Losses */}
                      <td className="py-3 text-center text-red-500 font-medium tabular-nums">{teamRow.lost}</td>
                      
                      {/* Goals For / Against */}
                      <td className="py-3 text-center text-xs text-slate-400 tabular-nums">
                        {teamRow.goalsFor}/{teamRow.goalsAgainst}
                      </td>

                      {/* Goal Difference */}
                      <td
                        className={`py-3 text-center font-medium tabular-nums ${
                          teamRow.goalDifference > 0
                            ? "text-emerald-600"
                            : teamRow.goalDifference < 0
                            ? "text-red-500"
                            : "text-slate-400"
                        }`}
                      >
                        {teamRow.goalDifference > 0 ? `+${teamRow.goalDifference}` : teamRow.goalDifference}
                      </td>

                      {/* Points */}
                      <td className="py-3 text-right pr-2 font-extrabold text-blue-600 text-sm tabular-nums">
                        {teamRow.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Legend */}
          <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5 pt-3 border-t border-slate-100">
            <span className="w-2 h-2 rounded bg-blue-50 border border-blue-100"></span>
            <span>代表前二名出線小組賽，晉級 32 強淘汰賽</span>
          </div>
        </div>
      ))}
    </div>
  );
}
