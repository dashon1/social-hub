import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import CalendarView from "../components/calendar/CalendarView.jsx";
import CommentsThread from "../components/posts/CommentsThread.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Calendar() {
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null);

  const handleCreatePost = () => {
    navigate(createPageUrl("CreatePost"));
  };

  const handleSelectPost = (post) => {
    setSelectedPost(post);
  };
  
  const handlePostUpdate = (updatedPost) => {
    setSelectedPost(updatedPost);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">Content Calendar</h1>
          <p className="text-slate-600 dark:text-slate-400">Plan and schedule your social media content</p>
        </div>
      </div>

      <CalendarView 
        onCreatePost={handleCreatePost}
        onSelectPost={handleSelectPost}
      />

      {selectedPost && (
        <Card className="border-0 shadow-xl dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Post Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm dark:text-slate-400">Title</Label>
                <p className="font-semibold text-slate-900 dark:text-white">{selectedPost.title}</p>
              </div>
              <div>
                <Label className="text-sm dark:text-slate-400">Platform</Label>
                <p className="font-semibold text-slate-900 dark:text-white capitalize">{selectedPost.platform}</p>
              </div>
              <div>
                <Label className="text-sm dark:text-slate-400">Scheduled Date</Label>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {selectedPost.scheduled_date ? new Date(selectedPost.scheduled_date).toLocaleString() : 'Not scheduled'}
                </p>
              </div>
              <div>
                <Label className="text-sm dark:text-slate-400">Status</Label>
                <p className="font-semibold text-slate-900 dark:text-white capitalize">{selectedPost.status}</p>
              </div>
               <div>
                <Label className="text-sm dark:text-slate-400">Content</Label>
                <p className="text-slate-800 dark:text-slate-200 mt-1 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">{selectedPost.content}</p>
              </div>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-700 pt-6 md:pt-0 md:pl-8">
              <CommentsThread post={selectedPost} onPostUpdate={handlePostUpdate} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}