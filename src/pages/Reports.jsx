import React, { useState } from "react";
import { SocialPost } from "@/entities/SocialPost";
import { Analytics } from "@/entities/Analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Download,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare
} from "lucide-react";
import { format, isWithinInterval, parseISO } from "date-fns";

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: MessageSquare,
};

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);
    try {
      const allPosts = await SocialPost.list();
      const allAnalytics = await Analytics.list();

      const filteredPosts = allPosts.filter(post => {
        if (!post.created_date) return false;
        return isWithinInterval(parseISO(post.created_date), {
          start: parseISO(startDate),
          end: parseISO(endDate)
        });
      });

      const analyticsMap = {};
      allAnalytics.forEach(a => {
        analyticsMap[a.post_id] = a;
      });

      const totalImpressions = filteredPosts.reduce((sum, post) => 
        sum + (analyticsMap[post.id]?.impressions || 0), 0);
      const totalLikes = filteredPosts.reduce((sum, post) => 
        sum + (analyticsMap[post.id]?.likes || 0), 0);
      const totalComments = filteredPosts.reduce((sum, post) => 
        sum + (analyticsMap[post.id]?.comments || 0), 0);
      const totalShares = filteredPosts.reduce((sum, post) => 
        sum + (analyticsMap[post.id]?.shares || 0), 0);
      const totalReach = filteredPosts.reduce((sum, post) => 
        sum + (analyticsMap[post.id]?.reach || 0), 0);

      const platformBreakdown = {};
      filteredPosts.forEach(post => {
        if (!platformBreakdown[post.platform]) {
          platformBreakdown[post.platform] = { posts: 0, engagement: 0 };
        }
        platformBreakdown[post.platform].posts++;
        platformBreakdown[post.platform].engagement += analyticsMap[post.id]?.likes || 0;
      });

      const topPosts = filteredPosts
        .map(post => ({
          ...post,
          analytics: analyticsMap[post.id]
        }))
        .filter(post => post.analytics)
        .sort((a, b) => b.analytics.engagement_rate - a.analytics.engagement_rate)
        .slice(0, 5);

      setReportData({
        period: { start: startDate, end: endDate },
        totalPosts: filteredPosts.length,
        totalImpressions,
        totalLikes,
        totalComments,
        totalShares,
        totalReach,
        avgEngagement: filteredPosts.length > 0 
          ? ((totalLikes + totalComments + totalShares) / filteredPosts.length).toFixed(1)
          : 0,
        platformBreakdown,
        topPosts
      });
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;

    const reportText = `
SOCIAL MEDIA PERFORMANCE REPORT
Period: ${format(parseISO(reportData.period.start), 'MMM d, yyyy')} - ${format(parseISO(reportData.period.end), 'MMM d, yyyy')}

OVERVIEW
Total Posts: ${reportData.totalPosts}
Total Impressions: ${reportData.totalImpressions.toLocaleString()}
Total Reach: ${reportData.totalReach.toLocaleString()}
Total Likes: ${reportData.totalLikes.toLocaleString()}
Total Comments: ${reportData.totalComments.toLocaleString()}
Total Shares: ${reportData.totalShares.toLocaleString()}
Average Engagement: ${reportData.avgEngagement}

PLATFORM BREAKDOWN
${Object.entries(reportData.platformBreakdown).map(([platform, data]) => 
  `${platform}: ${data.posts} posts, ${data.engagement} total engagement`
).join('\n')}

TOP PERFORMING POSTS
${reportData.topPosts.map((post, i) => 
  `${i + 1}. ${post.title} - ${post.analytics.engagement_rate}% engagement`
).join('\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-media-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Reports</h1>
        <p className="text-slate-600">Generate comprehensive reports for any time period</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={generateReport}
              disabled={loading || !startDate || !endDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">
              Report: {format(parseISO(reportData.period.start), 'MMM d')} - {format(parseISO(reportData.period.end), 'MMM d, yyyy')}
            </h2>
            <Button variant="outline" onClick={downloadReport}>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 font-medium">Total Posts</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{reportData.totalPosts}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 font-medium">Total Impressions</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {reportData.totalImpressions.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 font-medium">Total Reach</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {reportData.totalReach.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <p className="text-sm text-slate-600 font-medium">Avg Engagement</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{reportData.avgEngagement}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(reportData.platformBreakdown).map(([platform, data]) => {
                    const Icon = platformIcons[platform];
                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-slate-600" />
                          <span className="font-medium capitalize">{platform}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{data.posts} posts</p>
                          <p className="text-sm text-slate-500">{data.engagement} engagement</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.topPosts.map((post, index) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{post.title}</p>
                        <p className="text-sm text-slate-500 capitalize">{post.platform}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{post.analytics.engagement_rate}%</p>
                        <p className="text-xs text-slate-500">engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}