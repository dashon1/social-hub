import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const platformData = [
  {
    name: "Instagram",
    followers: "12.4K",
    engagement: "4.2%",
    posts: 8,
    bgColor: "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950"
  },
  {
    name: "Facebook",
    followers: "8.7K",
    engagement: "2.8%",
    posts: 5,
    bgColor: "bg-blue-50 dark:bg-blue-950"
  },
  {
    name: "Twitter",
    followers: "5.2K",
    engagement: "3.1%",
    posts: 12,
    bgColor: "bg-sky-50 dark:bg-sky-950"
  },
  {
    name: "LinkedIn",
    followers: "3.8K",
    engagement: "5.4%",
    posts: 3,
    bgColor: "bg-blue-50 dark:bg-blue-950"
  }
];

const PlatformOverview = React.memo(function PlatformOverview() {
  return (
    <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Platform Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformData.map((platform) => (
            <div 
              key={platform.name}
              className={`${platform.bgColor} rounded-xl p-4 transition-all duration-300 hover:scale-105 border border-slate-100 dark:border-slate-700`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">{platform.name}</h3>
                <Badge variant="secondary" className="bg-white/80 dark:bg-slate-800/80">
                  {platform.posts} posts
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Followers</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{platform.followers}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Engagement</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{platform.engagement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export default PlatformOverview;