import React, { useState, useEffect } from "react";
import { Campaign } from "@/entities/Campaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Target, Plus, Calendar, DollarSign, Users } from "lucide-react";
import { format } from "date-fns";

const platforms = ["instagram", "facebook", "twitter", "linkedin", "tiktok", "youtube"];
const statuses = ["planning", "active", "paused", "completed"];

const statusColors = {
  planning: "bg-gray-100 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800"
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    budget: "",
    target_audience: "",
    status: "planning",
    platforms: []
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await Campaign.list("-created_date");
      setCampaigns(data);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingCampaign) {
        await Campaign.update(editingCampaign.id, formData);
      } else {
        await Campaign.create(formData);
      }
      setDialogOpen(false);
      resetForm();
      loadCampaigns();
    } catch (error) {
      console.error("Error saving campaign:", error);
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      budget: campaign.budget || "",
      target_audience: campaign.target_audience || "",
      status: campaign.status,
      platforms: campaign.platforms || []
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      budget: "",
      target_audience: "",
      status: "planning",
      platforms: []
    });
    setEditingCampaign(null);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            Marketing Campaigns
          </h1>
          <p className="text-slate-600">Oversee and manage all your campaign efforts</p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }} 
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Campaigns Yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first marketing campaign to organize and track your social media efforts
            </p>
            <Button 
              onClick={() => {
                resetForm();
                setDialogOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{campaign.name}</CardTitle>
                    <p className="text-sm text-slate-600 line-clamp-2">{campaign.description}</p>
                  </div>
                  <Badge className={statusColors[campaign.status]}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">Start Date</p>
                      <p className="font-medium text-slate-900">
                        {format(new Date(campaign.start_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs text-slate-500">End Date</p>
                      <p className="font-medium text-slate-900">
                        {format(new Date(campaign.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>

                {campaign.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-slate-900">
                      ${parseFloat(campaign.budget).toLocaleString()} Budget
                    </span>
                  </div>
                )}

                {campaign.target_audience && (
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-xs text-slate-500">Target Audience</p>
                      <p className="text-sm text-slate-900">{campaign.target_audience}</p>
                    </div>
                  </div>
                )}

                {campaign.platforms && campaign.platforms.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.platforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="capitalize">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={() => handleEdit(campaign)}
                  className="w-full mt-4"
                >
                  Edit Campaign
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                placeholder="Summer Product Launch"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your campaign objectives..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange("start_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange("end_date", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="5000"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                placeholder="Tech-savvy millennials, 25-35 years old"
                value={formData.target_audience}
                onChange={(e) => handleInputChange("target_audience", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Platforms</Label>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map(platform => (
                  <Button
                    key={platform}
                    type="button"
                    variant={formData.platforms.includes(platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePlatformToggle(platform)}
                    className="capitalize"
                  >
                    {platform}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.start_date || !formData.end_date}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {editingCampaign ? "Update Campaign" : "Create Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}