import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Calendar, Plus, BarChart3, Settings } from "lucide-react";

const tabs = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Calendar", icon: Calendar, page: "Calendar" },
  { name: "Create", icon: Plus, page: "CreatePost", accent: true },
  { name: "Analytics", icon: BarChart3, page: "Analytics" },
  { name: "Settings", icon: Settings, page: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = (e, tab) => {
    const tabUrl = createPageUrl(tab.page);
    const isActive = location.pathname === tabUrl;
    if (isActive) {
      // Already on this tab — force re-navigate to reset stack to root
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Replace current entry to clear any stale state
      navigate(tabUrl, { replace: true });
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 select-none"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === createPageUrl(tab.page);
          const Icon = tab.icon;

          if (tab.accent) {
            return (
              <Link
                key={tab.name}
                to={createPageUrl(tab.page)}
                onClick={(e) => handleTabClick(e, tab)}
                className="flex flex-col items-center justify-center -mt-5 select-none"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] mt-1 font-medium text-slate-500 dark:text-slate-400">
                  {tab.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.name}
              to={createPageUrl(tab.page)}
              onClick={(e) => handleTabClick(e, tab)}
              className="flex flex-col items-center justify-center gap-0.5 min-h-[44px] min-w-[44px] select-none active:scale-95 transition-transform"
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}