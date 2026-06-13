import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function MobileHeader({ title, showBack = false }) {
  const navigate = useNavigate();

  return (
    <div
      className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 select-none"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center h-12 px-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 select-none active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
          {title}
        </h1>
      </div>
    </div>
  );
}