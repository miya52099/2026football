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
    <div className="w-full max-w-2xl mx-auto space-y-3" id="search-bar-container">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          <Search size={20} />
        </div>
        <input
          type="text"
          id="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="搜尋隊伍名稱、組別、或多個隊伍（例如：美國 澳洲）..."
          className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-slate-800 placeholder-slate-400 rounded-xl shadow-sm transition-all outline-none text-sm md:text-base font-sans"
        />
        {value && (
          <button
            type="button"
            id="clear-search-button"
            onClick={onClear}
            className="absolute right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 items-center text-xs md:text-sm text-slate-500 pl-1" id="quick-searches">
        <span className="font-medium text-slate-400">熱門搜尋：</span>
        {quickSearches.map((item, index) => (
          <button
            key={index}
            id={`quick-search-${index}`}
            onClick={() => onChange(item.value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
              value === item.value
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
