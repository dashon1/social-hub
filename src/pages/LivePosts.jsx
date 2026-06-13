import React, { useState, useEffect } from "react";
import { SocialPost } from "@/entities/SocialPost";
import { Analytics } from "@/entities/Analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share, 
  Eye,
  RefreshCw,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";

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

export default function LivePosts() {
  const [posts, setPosts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const publishedPosts = await SocialPost.filter({ status: "published" }, "-created_date", 20);
      setPosts(publishedPosts);

      const allAnalytics = await Analytics.list();
      const analyticsMap = {};
      allAnalytics.forEach(analytic => {
        analyticsMap[analytic.post_id] = analytic;
      });
      setAnalytics(analyticsMap);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Live Performance</h1>
          <p className="text-slate-600">Track your published posts in real-time</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Published Posts Yet</h3>
            <p className="text-slate-600">Publish your first post to see live performance metrics here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => {
            const postAnalytics = analytics[post.id];
            const IconComponent = platformIcons[post.platform];

            return (
              <Card key={post.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${platformColors[post.platform]} shadow-sm`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <p className="text-sm text-slate-500">
                          Published {format(new Date(post.created_date), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 mb-4 line-clamp-2">{post.content}</p>
                  
                  {postAnalytics ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="text-xs text-slate-500">Impressions</p>
                          <p className="text-lg font-bold text-slate-900">
                            {postAnalytics.impressions?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-500" />
                        <div>
                          <p className="text-xs text-slate-500">Likes</p>
                          <p className="text-lg font-bold text-slate-900">
                            {postAnalytics.likes?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="text-xs text-slate-500">Comments</p>
                          <p className="text-lg font-bold text-slate-900">
                            {postAnalytics.comments?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Share className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="text-xs text-slate-500">Shares</p>
                          <p className="text-lg font-bold text-slate-900">
                            {postAnalytics.shares?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <div>
                          <p className="text-xs text-slate-500">Engagement</p>
                          <p className="text-lg font-bold text-slate-900">
                            {postAnalytics.engagement_rate}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-500">
                      <p className="text-sm">Analytics not yet available</p>
                      <p className="text-xs">Click "Sync Analytics" on the Dashboard to generate data</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}