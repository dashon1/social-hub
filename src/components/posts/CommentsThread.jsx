import React, { useState } from 'react';
import { User } from "@/entities/User";
import { SocialPost } from "@/entities/SocialPost";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";
import { format } from "date-fns";

export default function CommentsThread({ post, onPostUpdate }) {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    };
    fetchUser();
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    const optimisticComment = {
      user_name: currentUser.full_name,
      user_email: currentUser.email,
      comment: newComment,
      date: new Date().toISOString()
    };

    // Optimistic update
    const previousComments = post.comments || [];
    const optimisticComments = [...previousComments, optimisticComment];
    if (onPostUpdate) {
      onPostUpdate({ ...post, comments: optimisticComments });
    }
    setNewComment("");
    setSubmitting(true);

    try {
      await SocialPost.update(post.id, {
        comments: optimisticComments
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      // Revert on failure
      if (onPostUpdate) {
        onPostUpdate({ ...post, comments: previousComments });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const comments = post.comments || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
        <MessageCircle className="w-5 h-5 select-none" />
        <span>Comments ({comments.length})</span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                {comment.user_name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-900 dark:text-white">
                    {comment.user_name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(comment.date), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{comment.comment}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 min-h-[80px] dark:bg-slate-800 dark:border-slate-600 dark:text-white"
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || submitting}
          size="icon"
          className="bg-blue-600 hover:bg-blue-700 min-w-[44px] min-h-[44px] select-none"
        >
          <Send className="w-4 h-4 select-none" />
        </Button>
      </div>
    </div>
  );
}