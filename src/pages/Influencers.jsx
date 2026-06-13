import React, { useState, useEffect } from "react";
import { Influencer } from "@/entities/Influencer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Users, TrendingUp, Plus } from "lucide-react";

export default function Influencers() {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    setLoading(true);
    try {
      const data = await Influencer.list("-follower_count");
      setInfluencers(data);
    } catch (error) {
      console.error("Error loading influencers:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    available: "bg-green-100 text-green-800",
    contacted: "bg-blue-100 text-blue-800",
    collaborating: "bg-purple-100 text-purple-800",
    archived: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-500" />
            Influencer Marketplace
          </h1>
          <p className="text-slate-600">Connect and collaborate with influencers</p>
        </div>
        <Button className="bg-yellow-500 hover:bg-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Influencer
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : influencers.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Influencers Added</h3>
            <p className="text-slate-600 mb-6">Start building your influencer network</p>
            <Button className="bg-yellow-500 hover:bg-yellow-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Influencer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map(inf => (
            <Card key={inf.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{inf.name}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">{inf.niche}</p>
                  </div>
                  <Badge className={statusColors[inf.status]}>{inf.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Followers</p>
                    <p className="text-lg font-bold text-slate-900 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {(inf.follower_count || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Engagement</p>
                    <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {inf.engagement_rate || 0}%
                    </p>
                  </div>
                </div>
                {inf.rate_per_post > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs text-slate-600">Rate per Post</p>
                    <p className="text-xl font-bold text-slate-900">${inf.rate_per_post}</p>
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}