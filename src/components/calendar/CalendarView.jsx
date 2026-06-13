import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SocialPost } from "@/entities/SocialPost";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube, 
  MessageSquare,
  Plus
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";

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

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  pending_approval: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  scheduled: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800"
};

export default function CalendarView({ onCreatePost, onSelectPost }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const allPosts = await SocialPost.list("-scheduled_date");
      setPosts(allPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPostsForDate = (date) => {
    return posts.filter(post => {
      if (!post.scheduled_date) return false;
      return isSameDay(parseISO(post.scheduled_date), date);
    });
  };

  const selectedDatePosts = getPostsForDate(selectedDate);

  const getDateWithPosts = () => {
    const dates = new Set();
    posts.forEach(post => {
      if (post.scheduled_date) {
        const postDate = parseISO(post.scheduled_date);
        dates.add(format(postDate, 'yyyy-MM-dd'));
      }
    });
    return dates;
  };

  const datesWithPosts = getDateWithPosts();

  const handleCreatePostClick = () => {
    if (onCreatePost) {
      onCreatePost();
    }
  };

  const handlePostClick = (post) => {
    if (onSelectPost) {
      onSelectPost(post);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">Content Calendar</CardTitle>
            <Button onClick={handleCreatePostClick} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasPost: (date) => datesWithPosts.has(format(date, 'yyyy-MM-dd'))
            }}
            modifiersStyles={{
              hasPost: {
                backgroundColor: '#e0e7ff',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Posts for Selected Date */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, 'MMMM d, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : selectedDatePosts.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No posts scheduled for this date</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCreatePostClick}
                className="mt-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule a Post
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDatePosts.map(post => {
                const IconComponent = platformIcons[post.platform];
                return (
                  <div
                    key={post.id}
                    onClick={() => handlePostClick(post)}
                    className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-lg ${platformColors[post.platform]}`}>
                        <IconComponent className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="font-semibold text-sm text-slate-900 flex-1 truncate">
                        {post.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">
                        {format(parseISO(post.scheduled_date), 'h:mm a')}
                      </span>
                      <Badge className={`text-xs ${statusColors[post.status]}`}>
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}