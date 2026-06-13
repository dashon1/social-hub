import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlatformSelector from "../components/posts/PlatformSelector.jsx";
import { SocialPost } from "@/entities/SocialPost";
import { UploadFile, InvokeLLM } from "@/integrations/Core";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { sendApprovalNotification } from "@/functions/sendApprovalNotification";
import { publishToBlotato } from "@/functions/publishToBlotato";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  Upload,
  Calendar,
  Save,
  Send,
  X,
  Sparkles,
  Loader2,
  Wand2,
  Clock,
  CheckCircle
} from "lucide-react";
import { User } from "@/entities/User";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import HelpTooltip from "../components/help/HelpTooltip.jsx";

// platforms list removed - now using PlatformSelector component

const postTypes = [
  { id: "text", name: "Text Only" },
  { id: "image", name: "Image Post" },
  { id: "video", name: "Video Post" },
  { id: "carousel", name: "Carousel" },
  { id: "story", name: "Story" }
];

export default function CreatePost() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    platform: "",
    platforms: [],
    post_type: "text",
    scheduled_date: "",
    hashtags: "",
    media_urls: []
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [suggestingHashtags, setSuggestingHashtags] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [suggestingTime, setSuggestingTime] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    
    const timer = setTimeout(() => {
      fetchUser();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of selectedFiles) {
        const { file_url } = await UploadFile({ file });
        uploadedUrls.push(file_url);
      }

      setFormData(prev => ({
        ...prev,
        media_urls: [...prev.media_urls, ...uploadedUrls]
      }));
      setFiles(prev => [...prev, ...selectedFiles]);
      
      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} file(s) uploaded successfully.`,
        duration: 3000
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, i) => i !== index)
    }));
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateContent = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Generate Content clicked");
    
    if (!formData.title) {
      toast({
        title: "Title Required",
        description: "Please enter a post title or topic first.",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingContent(true);
    try {
      console.log("Calling InvokeLLM...");
      const result = await InvokeLLM({
        prompt: `Write an engaging social media post about "${formData.title}". Make it concise, compelling, and suitable for social media (keep it under 200 characters if possible). Do not include hashtags.`,
      });
      
      console.log("LLM Result:", result);
      handleInputChange('content', result);

      toast({
        title: "Content Generated!",
        description: "AI has created content for your post.",
        duration: 3000
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleSuggestHashtags = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Suggest Hashtags clicked");
    
    if (!formData.content) {
      toast({
        title: "Content Required",
        description: "Please write some content first to suggest hashtags.",
        variant: "destructive"
      });
      return;
    }
    
    setSuggestingHashtags(true);
    try {
      console.log("Calling InvokeLLM for hashtags...");
      const result = await InvokeLLM({
        prompt: `Based on the following social media post content, generate a comma-separated list of 5-7 relevant and trending hashtags (without the # symbol, just the words). Content: "${formData.content}"`,
      });
      
      const hashtags = result.split(',')
        .map(h => h.trim())
        .filter(h => h !== '')
        .map(h => h.startsWith('#') ? h : `#${h}`)
        .join(' ');

      handleInputChange('hashtags', hashtags);

      toast({
        title: "Hashtags Generated!",
        description: "AI has suggested relevant hashtags for your post.",
        duration: 3000
      });

    } catch (error) {
      console.error("Error suggesting hashtags:", error);
      toast({
        title: "Error",
        description: "Failed to suggest hashtags. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setSuggestingHashtags(false);
    }
  };

  const handleSuggestScheduleTime = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log("Suggest Time clicked");
    
    if (formData.platforms.length === 0) {
      toast({
        title: "Platform Required",
        description: "Please select at least one platform first.",
        variant: "destructive"
      });
      return;
    }

    setSuggestingTime(true);
    try {
      console.log("Calling InvokeLLM for time suggestion...");
      const result = await InvokeLLM({
        prompt: `Based on typical engagement patterns for ${formData.platforms.join(', ')}, suggest the best date and time to post in the next 7 days. Consider peak engagement hours. Return only a datetime in this exact format: YYYY-MM-DDTHH:MM (for example: 2025-01-15T14:30). Do not include any other text.`,
      });

      const suggestedTime = result.trim().replace(/"/g, '');
      handleInputChange('scheduled_date', suggestedTime);

      toast({
        title: "Time Suggested!",
        description: "AI has recommended an optimal posting time.",
        duration: 3000
      });
    } catch (error) {
      console.error("Error suggesting time:", error);
      toast({
        title: "Error",
        description: "Failed to suggest time. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setSuggestingTime(false);
    }
  };

  const handleSave = async (status = "draft") => {
    console.log("Save clicked with status:", status);
    
    if (!formData.title || !formData.content || formData.platforms.length === 0) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in title, content, and select at least one platform.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      console.log("Creating post...");
      const newPost = await SocialPost.create({
        ...formData,
        platform: formData.platforms[0] || "",
        status: status
      });

      console.log("Post created:", newPost);

      if (status === "pending_approval") {
        try {
          await sendApprovalNotification({ postId: newPost.id });
        } catch (error) {
          console.error("Failed to send approval notifications:", error);
        }
        
        toast({
          title: "Submitted for Approval",
          description: "Your post has been submitted for review by an admin.",
          duration: 3000
        });
      } else if (status === "scheduled" && !formData.scheduled_date) {
        try {
          await publishToBlotato({ postId: newPost.id });
          toast({
            title: "Post Published",
            description: "Your post has been published successfully!",
            duration: 3000
          });
        } catch (error) {
          console.error("Failed to publish:", error);
          toast({
            title: "Publishing Error",
            description: "Post saved but publishing failed. Please try again.",
            variant: "destructive",
            duration: 3000
          });
        }
      } else {
        toast({
          title: status === "approved" ? "Post Approved" : "Post Saved",
          description: `Post saved as ${status}.`,
          duration: 3000
        });
      }

      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 1500);
    } catch (error) {
      console.error("Error saving post:", error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <Toaster />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Create New Post</h1>
          <p className="text-slate-600 dark:text-slate-400">Design and schedule content for your social media platforms</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="min-h-[44px] select-none dark:border-slate-600 dark:text-white"
        >
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Post Details</CardTitle>
                <HelpTooltip 
                  title="Post Creation" 
                  content="Fill in your post details here. Use AI to generate content, suggest hashtags, or find the best time to post."
                  position="left"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title / Topic *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title or topic..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="content">Content *</Label>
                    <HelpTooltip 
                      title="AI Content Generation" 
                      content="Click 'Generate with AI' to automatically create engaging content based on your post title."
                      position="right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateContent}
                    disabled={generatingContent || !formData.title}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] select-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                  >
                    {generatingContent ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        <span>Generate with AI</span>
                      </>
                    )}
                  </button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write your post content here, or generate it with AI..."
                  rows={6}
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className="resize-none"
                />
                <p className="text-sm text-slate-500">
                  {formData.content.length}/2200 characters
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="hashtags">Hashtags</Label>
                  <HelpTooltip 
                    title="Hashtag Suggestions" 
                    content="Use the AI sparkle button to get trending and relevant hashtag suggestions."
                    position="right"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="hashtags"
                    placeholder="#marketing #socialmedia #content"
                    value={formData.hashtags}
                    onChange={(e) => handleInputChange("hashtags", e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleSuggestHashtags}
                    disabled={suggestingHashtags || !formData.content}
                    title="Suggest Hashtags with AI"
                    className="inline-flex items-center justify-center w-11 h-11 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0 select-none dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    {suggestingHashtags ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-purple-500" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Media Upload
                </CardTitle>
                <HelpTooltip 
                  title="Media Files" 
                  content="Upload images, videos, or other media files to accompany your post."
                  position="left"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-slate-300 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="media-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                  ) : (
                    <Upload className="w-12 h-12 text-slate-400" />
                  )}
                  <p className="text-slate-600 font-medium">
                    {uploading ? "Uploading..." : "Click to upload media"}
                  </p>
                  <p className="text-sm text-slate-500">
                    Support for images and videos
                  </p>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-slate-900">Uploaded Media:</p>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Platforms *</CardTitle>
                <HelpTooltip 
                  title="Choose Platforms" 
                  content="Select which social media platforms you want to publish this post to. You can pick one or multiple."
                  position="left"
                />
              </div>
            </CardHeader>
            <CardContent>
              <PlatformSelector
                selectedPlatforms={formData.platforms}
                onChange={(platforms) => handleInputChange("platforms", platforms)}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Post Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.post_type} onValueChange={(value) => handleInputChange("post_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Schedule
                </CardTitle>
                <HelpTooltip 
                  title="Smart Scheduling" 
                  content="Choose when to publish or let AI suggest the optimal time."
                  position="left"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Publish Date & Time</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={formData.scheduled_date}
                  onChange={(e) => handleInputChange("scheduled_date", e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleSuggestScheduleTime}
                disabled={suggestingTime || formData.platforms.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] select-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
              >
                {suggestingTime ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Suggesting...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Suggest Best Time (AI)
                  </>
                )}
              </button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6 space-y-3">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleSave("approved")}
                  disabled={saving || !formData.title || !formData.content || formData.platforms.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] select-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Save & Approve
                    </>
                  )}
                </button>
              )}
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => handleSave("pending_approval")}
                  disabled={saving || !formData.title || !formData.content || formData.platforms.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] select-none"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit for Approval
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave("scheduled")}
                disabled={saving || !formData.title || !formData.content || formData.platforms.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] select-none"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {formData.scheduled_date ? "Schedule Post" : "Publish Now"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] select-none dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </>
                )}
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}