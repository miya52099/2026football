"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export default function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  const quickSearches = [
    { label: "美國 澳洲", value: "美國 澳洲" },
    { label: "美國", value: "美國" },
    { label: "英格蘭", value: "英格蘭" },
    { label: "A 組", value: "A 組" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3" id="next-search-bar">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜尋隊伍名稱、組別、或多個隊伍（例如：美國 澳洲）..."
          className="w-full pl-12 pr-12 py-3.5 bg-slate-800/80 border border-slate-700 hover:border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-slate-400 rounded-xl shadow-lg transition-all outline-none text-sm md:text-base"
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-4 p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm text-slate-400 pl-1">
        <span className="font-medium text-slate-500">熱門搜尋：</span>
        {quickSearches.map((item, index) => (
          <button
            key={index}
            onClick={() => onChange(item.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
              value === item.value
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/80 hover:border-slate-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
