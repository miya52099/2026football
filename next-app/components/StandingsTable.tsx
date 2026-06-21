import React from "react";

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

interface StandingsTableProps {
  standings: GroupStanding[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-700/50 text-slate-400 font-sans">
        沒有可顯示的小組排名數據。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {standings.map((groupStanding, index) => (
        <div
          key={index}
          className="bg-slate-800/30 border border-slate-700/60 rounded-2xl p-5 shadow-lg flex flex-col"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-cyan-500 rounded-full"></span>
            {groupStanding.group}
          </h3>

          <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
            <table className="w-full text-left border-collapse min-w-[320px]">
              <thead>
                <tr className="border-b border-slate-700/50 text-xs text-slate-400 font-semibold tracking-wider">
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
              <tbody className="divide-y divide-slate-700/20 text-sm">
                {groupStanding.teams.map((teamRow, idx) => {
                  const rank = idx + 1;
                  const isTopTwo = rank <= 2;

                  return (
                    <tr
                      key={idx}
                      className="hover:bg-slate-700/20 transition-all duration-150 text-slate-100"
                    >
                      <td className="py-3 text-center font-bold">
                        <span
                          className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                            isTopTwo
                              ? "bg-cyan-500/10 text-cyan-400 font-bold"
                              : "text-slate-500"
                          }`}
                        >
                          {rank}
                        </span>
                      </td>

                      <td className="py-3 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-600/30"></span>
                          {teamRow.team}
                        </div>
                      </td>

                      <td className="py-3 text-center text-slate-300 tabular-nums">{teamRow.played}</td>
                      <td className="py-3 text-center text-emerald-400 font-medium tabular-nums">{teamRow.won}</td>
                      <td className="py-3 text-center text-slate-300 tabular-nums">{teamRow.draw}</td>
                      <td className="py-3 text-center text-rose-400 font-medium tabular-nums">{teamRow.lost}</td>
                      <td className="py-3 text-center text-xs text-slate-400 tabular-nums">
                        {teamRow.goalsFor}/{teamRow.goalsAgainst}
                      </td>

                      <td
                        className={`py-3 text-center font-medium tabular-nums ${
                          teamRow.goalDifference > 0
                            ? "text-emerald-400"
                            : teamRow.goalDifference < 0
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {teamRow.goalDifference > 0 ? `+${teamRow.goalDifference}` : teamRow.goalDifference}
                      </td>

                      <td className="py-3 text-right pr-2 font-extrabold text-cyan-400 text-base tabular-nums">
                        {teamRow.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-700/10">
            <span className="w-2 h-2 rounded bg-cyan-500/20 border border-cyan-500/30"></span>
            <span>代表前二名出線小組賽，晉級 32 強淘汰賽</span>
          </div>
        </div>
      ))}
    </div>
  );
}
