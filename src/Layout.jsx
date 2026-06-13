import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/User";
import TutorialOverlay from "./components/onboarding/TutorialOverlay.jsx";
import NotificationCenter from "./components/notifications/NotificationCenter.jsx";
import BottomNav from "./components/mobile/BottomNav.jsx";
import MobileHeader from "./components/mobile/MobileHeader.jsx";
import PageTransition from "./components/mobile/PageTransition.jsx";
import { TabStateProvider, useTabState } from "./components/mobile/TabStateProvider.jsx";
import { AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  Plus,
  BarChart3,
  FolderOpen,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  Target,
  Radio,
  FileText,
  CheckSquare,
  CreditCard,
  Users as UsersIcon,
  Settings as SettingsIcon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Content Calendar", url: createPageUrl("Calendar"), icon: Calendar },
  { title: "Create Post", url: createPageUrl("CreatePost"), icon: Plus },
  { title: "Templates", url: createPageUrl("Templates"), icon: FileText },
  { title: "Live Posts", url: createPageUrl("LivePosts"), icon: Radio },
  { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3 },
  { title: "Reports", url: createPageUrl("Reports"), icon: FileText },
  { title: "Predictions", url: createPageUrl("Predictions"), icon: BarChart3 },
  { title: "A/B Testing", url: createPageUrl("ABTesting"), icon: CheckSquare },
  { title: "Social Listening", url: createPageUrl("SocialListening"), icon: Radio },
  { title: "Competitors", url: createPageUrl("Competitors"), icon: Target },
  { title: "Influencers", url: createPageUrl("Influencers"), icon: Target },
  { title: "Smart Inbox", url: createPageUrl("SmartInbox"), icon: MessageSquare },
  { title: "Approvals", url: createPageUrl("Approvals"), icon: CheckSquare },
  { title: "Campaigns", url: createPageUrl("Campaigns"), icon: Target },
  { title: "Content Library", url: createPageUrl("Library"), icon: FolderOpen },
  { title: "Subscription", url: createPageUrl("Subscription"), icon: CreditCard },
  { title: "Settings", url: createPageUrl("Settings"), icon: SettingsIcon },
];

const adminOnlyItems = [
  { title: "Team", url: createPageUrl("TeamManagement"), icon: UsersIcon },
  { title: "Platform Setup", url: createPageUrl("PlatformSetup"), icon: Radio },
];

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: MessageSquare,
};

const platformColors = {
  instagram: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-black",
};

export default function Layout({ children, currentPageName }) {
  if (currentPageName === "Home") {
    return children;
  }

  return (
    <TabStateProvider>
      <LayoutInner currentPageName={currentPageName}>{children}</LayoutInner>
    </TabStateProvider>
  );
}

function LayoutInner({ children, currentPageName }) {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const scrollContainerRef = useRef(null);
  const tabState = useTabState();
  const prevPageRef = useRef(currentPageName);

  const fetchUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (e) {
      console.error("Failed to fetch user", e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUser();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Pages shown in bottom nav are root tabs — no back button
  const rootTabPages = ["Dashboard", "Calendar", "CreatePost", "Analytics", "Settings"];
  const isRootTab = rootTabPages.includes(currentPageName);

  // Save scroll position when leaving a root tab, restore when entering one
  useEffect(() => {
    const prevPage = prevPageRef.current;
    const container = scrollContainerRef.current;

    if (prevPage !== currentPageName && tabState) {
      // Save outgoing scroll
      if (rootTabPages.includes(prevPage) && container) {
        tabState.saveScrollPosition(prevPage, container.scrollTop);
      }
      // Restore incoming scroll
      if (rootTabPages.includes(currentPageName) && container) {
        requestAnimationFrame(() => {
          container.scrollTop = tabState.getScrollPosition(currentPageName);
        });
      }
    }
    prevPageRef.current = currentPageName;
  }, [currentPageName, tabState]);

  const pageTitle = navigationItems.find(i => i.url === location.pathname)?.title
    || adminOnlyItems.find(i => i.url === location.pathname)?.title
    || currentPageName;

  return (
    <SidebarProvider>
      <TutorialOverlay currentUser={currentUser} onUpdateUser={fetchUser} />
      <style>{`
        :root {
          color-scheme: light dark;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            --card: 222.2 84% 4.9%;
            --card-foreground: 210 40% 98%;
            --popover: 222.2 84% 4.9%;
            --popover-foreground: 210 40% 98%;
            --primary: 217.2 91.2% 59.8%;
            --primary-foreground: 222.2 47.4% 11.2%;
            --secondary: 217.2 32.6% 17.5%;
            --secondary-foreground: 210 40% 98%;
            --muted: 217.2 32.6% 17.5%;
            --muted-foreground: 215 20.2% 65.1%;
            --accent: 217.2 32.6% 17.5%;
            --accent-foreground: 210 40% 98%;
            --destructive: 0 62.8% 30.6%;
            --destructive-foreground: 210 40% 98%;
            --border: 217.2 32.6% 17.5%;
            --input: 217.2 32.6% 17.5%;
            --ring: 224.3 76.3% 48%;
          }
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900" style={{ overscrollBehavior: "none" }}>
        <Sidebar className="border-r border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white text-lg">SocialHub</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Marketing Command Center</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                Main Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950 hover:text-blue-700 dark:hover:text-blue-400 group ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 text-blue-700 dark:text-blue-400 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3 select-none">
                          <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {currentUser?.role === 'admin' && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                  Admin
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {adminOnlyItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950 dark:hover:to-red-950 hover:text-orange-700 dark:hover:text-orange-400 group ${
                            location.pathname === item.url ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 text-orange-700 dark:text-orange-400 shadow-sm' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-3 select-none">
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                Connected Platforms
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  {Object.entries(platformIcons).map(([platform, Icon]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${platformColors[platform]} shadow-sm`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{platform}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/50 dark:border-slate-700/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {currentUser ? (currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U') : 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                  {currentUser ? (currentUser.full_name || "User") : "User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser ? (currentUser.email || "Manage all social channels") : "Manage all social channels"}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 md:hidden">
                <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors duration-200 min-w-[44px] min-h-[44px] select-none" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">SocialHub</h1>
              </div>
              <div className="ml-auto">
                <NotificationCenter />
              </div>
            </div>
          </header>

          <div ref={scrollContainerRef} className="flex-1 overflow-auto" style={{ overscrollBehavior: "none" }}>
            <MobileHeader title={pageTitle} showBack={!isRootTab} />
            <div className="min-h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 pb-20 md:pb-0">
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  {children}
                </PageTransition>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </SidebarProvider>
  );
}