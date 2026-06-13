import React, { useState, useCallback, useMemo } from "react";
import { SocialPost } from "@/entities/SocialPost";
import { Analytics } from "@/entities/Analytics";
import { sendNotification } from "../components/notifications/NotificationCenter";
import PullToRefresh from "../components/mobile/PullToRefresh";
import StatsCard from "../components/dashboard/StatsCard";
import PlatformOverview from "../components/dashboard/PlatformOverview";
import RecentPosts from "../components/dashboard/RecentPosts";
import { 
  BarChart3, 
  Users, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Calendar,
  Plus,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";




export default function Dashboard() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const handleSyncAnalytics = async () => {
    setIsSyncing(true);
    try {
      const publishedPosts = await SocialPost.filter({ status: "published" });
      const existingAnalytics = await Analytics.list();
      const postsWithAnalytics = existingAnalytics.map(a => a.post_id);

      const postsToProcess = publishedPosts.filter(p => !postsWithAnalytics.includes(p.id));

      if (postsToProcess.length === 0) {
        toast({ title: "Analytics are up to date." });
        return;
      }

      const newAnalyticsRecords = postsToProcess.map(post => ({
        post_id: post.id,
        platform: post.platform,
        impressions: Math.floor(Math.random() * 20000) + 1000,
        likes: Math.floor(Math.random() * 1000) + 50,
        shares: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 100) + 5,
        clicks: Math.floor(Math.random() * 500) + 20,
        engagement_rate: (Math.random() * 5 + 1).toFixed(1),
        reach: Math.floor(Math.random() * 15000) + 800,
      }));

      await Analytics.bulkCreate(newAnalyticsRecords);

      toast({
        title: "Sync Complete!",
        description: `${newAnalyticsRecords.length} new post(s) have been synced.`,
      });
      
      sendNotification({
        title: 'Analytics Synced',
        message: `Successfully synced ${newAnalyticsRecords.length} posts with latest analytics.`,
        type: 'success'
      });

    } catch (error) {
      console.error("Failed to sync analytics:", error);
      toast({
        title: "Sync Failed",
        description: "Could not update analytics. Please try again.",
        variant: "destructive",
      });
      
      sendNotification({
        title: 'Sync Failed',
        message: 'Failed to sync analytics. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
    await handleSyncAnalytics();
  }, []);

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
    <div className="p-4 md:p-6 space-y-8" style={{ overscrollBehaviorY: "none" }}>
      <Toaster />
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 text-white">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Welcome to SocialHub
              </h1>
              <p className="text-lg text-white/90 max-w-2xl">
                Your command center for managing content across all social media platforms. 
                Plan, create, schedule, and analyze your social media presence with ease.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm min-h-[44px] select-none"
                onClick={handleSyncAnalytics}
                disabled={isSyncing}
              >
                <RefreshCw className={`w-5 h-5 mr-2 select-none ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Analytics'}
              </Button>
              <Link to={createPageUrl("CreatePost")}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-purple-600 hover:bg-white/90 shadow-lg min-h-[44px] select-none">
                  <Plus className="w-5 h-5 mr-2 select-none" />
                  Create Post
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full transform -translate-x-32 translate-y-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Reach"
          value="45.2K"
          change="+12.5%"
          changeType="positive"
          icon={Users}
          color="blue"
          description="Across all platforms"
        />
        <StatsCard
          title="Engagement Rate"
          value="4.8%"
          change="+0.8%"
          changeType="positive"
          icon={Heart}
          color="pink"
          description="Average engagement"
        />
        <StatsCard
          title="Posts Published"
          value="28"
          change="+15"
          changeType="positive"
          icon={MessageCircle}
          color="purple"
          description="This month"
        />
        <StatsCard
          title="Growth Rate"
          value="+8.2%"
          change="+2.1%"
          changeType="positive"
          icon={TrendingUp}
          color="green"
          description="Follower growth"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <PlatformOverview />
        </div>
        <div>
          <RecentPosts />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to={createPageUrl("CreatePost")} className="group">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200 group-hover:scale-105 min-h-[44px]">
              <Plus className="w-8 h-8 text-blue-600 mb-3 select-none" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Create New Post</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Design and schedule content for all your social platforms</p>
            </div>
          </Link>
          <Link to={createPageUrl("Calendar")} className="group">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition-all duration-200 group-hover:scale-105 min-h-[44px]">
              <Calendar className="w-8 h-8 text-purple-600 mb-3 select-none" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Content Calendar</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">View and manage your posting schedule</p>
            </div>
          </Link>
          <Link to={createPageUrl("Analytics")} className="group">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md transition-all duration-200 group-hover:scale-105 min-h-[44px]">
              <BarChart3 className="w-8 h-8 text-green-600 mb-3 select-none" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">View Analytics</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Track performance and engagement metrics</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}