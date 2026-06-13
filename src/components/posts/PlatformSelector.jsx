import React from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  Globe,
  Bookmark,
} from "lucide-react";

const allPlatforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-purple-500 via-pink-500 to-orange-500", bg: "bg-gradient-to-r from-purple-50 to-pink-50", border: "border-purple-300" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700", bg: "bg-blue-50", border: "border-blue-300" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "from-sky-500 to-sky-600", bg: "bg-sky-50", border: "border-sky-300" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-700 to-blue-800", bg: "bg-blue-50", border: "border-blue-400" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-600 to-red-700", bg: "bg-red-50", border: "border-red-300" },
  { id: "tiktok", name: "TikTok", icon: MessageSquare, color: "from-black to-gray-800", bg: "bg-gray-50", border: "border-gray-400" },
  { id: "bluesky", name: "Bluesky", icon: Globe, color: "from-blue-400 to-blue-500", bg: "bg-blue-50", border: "border-blue-300" },
  { id: "pinterest", name: "Pinterest", icon: Bookmark, color: "from-red-500 to-red-600", bg: "bg-red-50", border: "border-red-300" },
];

export default function PlatformSelector({ selectedPlatforms = [], onChange }) {
  const togglePlatform = (platformId) => {
    if (selectedPlatforms.includes(platformId)) {
      onChange(selectedPlatforms.filter((p) => p !== platformId));
    } else {
      onChange([...selectedPlatforms, platformId]);
    }
  };

  const selectAll = () => {
    onChange(allPlatforms.map((p) => p.id));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={selectAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-slate-500 hover:text-slate-700 font-medium"
        >
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {allPlatforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const Icon = platform.icon;
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? `${platform.bg} ${platform.border} shadow-sm`
                  : "bg-white border-slate-200 hover:border-slate-300 opacity-60"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isSelected ? `bg-gradient-to-r ${platform.color}` : "bg-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-slate-500"}`} />
              </div>
              <span className={`text-xs font-medium ${isSelected ? "text-slate-900" : "text-slate-500"}`}>
                {platform.name}
              </span>
            </button>
          );
        })}
      </div>
      {selectedPlatforms.length > 0 && (
        <p className="text-xs text-slate-500 text-center">
          {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}

export { allPlatforms };