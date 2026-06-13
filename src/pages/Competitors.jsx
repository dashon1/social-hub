import React, { useState, useEffect } from "react";
import { Competitor } from "@/entities/Competitor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function Competitors() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    instagram_handle: "",
    twitter_handle: "",
    platforms: []
  });

  useEffect(() => {
    loadCompetitors();
  }, []);

  const loadCompetitors = async () => {
    setLoading(true);
    try {
      const data = await Competitor.list("-created_date");
      setCompetitors(data);
    } catch (error) {
      console.error("Error loading competitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await Competitor.create(formData);
      setDialogOpen(false);
      setFormData({ name: "", instagram_handle: "", twitter_handle: "", platforms: [] });
      loadCompetitors();
    } catch (error) {
      console.error("Error adding competitor:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-600" />
            Competitor Intelligence
          </h1>
          <p className="text-slate-600">Track and analyze your competitors' social media performance</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Competitor
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : competitors.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Competitors Added</h3>
            <p className="text-slate-600 mb-6">Start tracking your competitors to gain strategic insights</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Competitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitors.map(comp => (
            <Card key={comp.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{comp.name}</span>
                  <Badge variant="secondary">{comp.platforms?.length || 0} platforms</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Engagement Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{comp.avg_engagement_rate || 0}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Posts/Week</p>
                    <p className="text-2xl font-bold text-slate-900">{comp.posting_frequency || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{(comp.follower_count || 0).toLocaleString()} followers</span>
                </div>
                {comp.platforms && comp.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {comp.platforms.map(p => (
                      <Badge key={p} variant="outline" className="text-xs capitalize">{p}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Competitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Competitor Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Company Name"
              />
            </div>
            <div>
              <Label>Instagram Handle</Label>
              <Input
                value={formData.instagram_handle}
                onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                placeholder="@username"
              />
            </div>
            <div>
              <Label>Twitter Handle</Label>
              <Input
                value={formData.twitter_handle}
                onChange={(e) => setFormData({...formData, twitter_handle: e.target.value})}
                placeholder="@username"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name}>Add Competitor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}