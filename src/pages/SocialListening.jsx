import React, { useState, useEffect } from "react";
import { SocialMention } from "@/entities/SocialMention";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Frown, Meh, Smile, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function SocialListening() {
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMentions();
  }, []);

  const loadMentions = async () => {
    setLoading(true);
    try {
      const data = await SocialMention.list("-mentioned_date", 50);
      setMentions(data);
    } catch (error) {
      console.error("Error loading mentions:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: mentions.length,
    positive: mentions.filter(m => m.sentiment === "positive").length,
    neutral: mentions.filter(m => m.sentiment === "neutral").length,
    negative: mentions.filter(m => m.sentiment === "negative").length,
  };

  const sentimentIcon = (sentiment) => {
    switch(sentiment) {
      case "positive": return <Smile className="w-4 h-4 text-green-500" />;
      case "negative": return <Frown className="w-4 h-4 text-red-500" />;
      default: return <Meh className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Social Listening
          </h1>
          <p className="text-slate-600">Monitor brand mentions and sentiment across platforms</p>
        </div>
        <Button onClick={loadMentions}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Total Mentions</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Positive</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats.positive}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Neutral</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">{stats.neutral}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <p className="text-sm text-slate-600">Negative</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{stats.negative}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Mentions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : mentions.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Mentions Yet</h3>
              <p className="text-slate-600">Start tracking keywords to see mentions here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mentions.map(mention => (
                <div key={mention.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {sentimentIcon(mention.sentiment)}
                      <div>
                        <p className="font-semibold text-slate-900">@{mention.author}</p>
                        <p className="text-xs text-slate-500 capitalize">{mention.platform}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{mention.engagement} engagement</Badge>
                  </div>
                  <p className="text-slate-700 text-sm">{mention.mention_text}</p>
                  {mention.url && (
                    <a href={mention.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                      View Original →
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}