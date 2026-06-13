import React, { useMemo, useCallback, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Share
} from "lucide-react";
import PullToRefresh from "../components/mobile/PullToRefresh";

const platformData = [
  { name: 'Instagram', followers: 12400, posts: 8, engagement: 4.2, color: '#E1306C' },
  { name: 'Facebook', followers: 8700, posts: 5, engagement: 2.8, color: '#1877F2' },
  { name: 'Twitter', followers: 5200, posts: 12, engagement: 3.1, color: '#1DA1F2' },
  { name: 'LinkedIn', followers: 3800, posts: 3, engagement: 5.4, color: '#0A66C2' }
];

const engagementData = [
  { date: 'Jan', likes: 1200, shares: 340, comments: 180 },
  { date: 'Feb', likes: 1400, shares: 420, comments: 220 },
  { date: 'Mar', likes: 1100, shares: 380, comments: 160 },
  { date: 'Apr', likes: 1800, shares: 510, comments: 280 },
  { date: 'May', likes: 2100, shares: 640, comments: 340 },
  { date: 'Jun', likes: 2400, shares: 720, comments: 410 }
];

const reachData = [
  { platform: 'Instagram', reach: 18500 },
  { platform: 'Facebook', reach: 12300 },
  { platform: 'Twitter', reach: 8900 },
  { platform: 'LinkedIn', reach: 5400 }
];

const COLORS = ['#E1306C', '#1877F2', '#1DA1F2', '#0A66C2'];

export default function Analytics() {
  const [, setRefreshKey] = useState(0);
  const handlePullRefresh = useCallback(async () => {
    setRefreshKey(k => k + 1);
  }, []);

  const charts = useMemo(() => (
    <>
      {/* Engagement Over Time */}
      <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="likes" stroke="#E1306C" strokeWidth={3} />
              <Line type="monotone" dataKey="shares" stroke="#1877F2" strokeWidth={3} />
              <Line type="monotone" dataKey="comments" stroke="#1DA1F2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Reach Distribution */}
      <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Platform Reach Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={reachData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="reach"
              >
                {reachData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card className="border-0 shadow-lg lg:col-span-2 dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Platform Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="followers" fill="#8884d8" name="Followers" />
              <Bar dataKey="posts" fill="#82ca9d" name="Posts" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  ), []);

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
    <div className="p-4 md:p-6 space-y-8" style={{ overscrollBehaviorY: "none" }}>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Track your social media performance and engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Reach</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">45.1K</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 select-none" />
                  <span className="text-sm text-green-600 font-medium">+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400 select-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Likes</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">12.8K</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 select-none" />
                  <span className="text-sm text-green-600 font-medium">+8.2%</span>
                </div>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-xl">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400 select-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Comments</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">2.4K</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 select-none" />
                  <span className="text-sm text-green-600 font-medium">+15.3%</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <MessageCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 select-none" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Shares</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">3.2K</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1 select-none" />
                  <span className="text-sm text-green-600 font-medium">+22.1%</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Share className="w-6 h-6 text-orange-600 dark:text-orange-400 select-none" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {charts}
      </div>

      {/* Platform Details */}
      <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Platform Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformData.map((platform) => (
              <div key={platform.name} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{platform.name}</h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Active</Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Followers</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{platform.followers.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Posts This Month</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{platform.posts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Engagement Rate</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{platform.engagement}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </PullToRefresh>
  );
}