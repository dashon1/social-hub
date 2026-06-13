import React, { useState, useEffect } from "react";
import { SocialPost } from "@/entities/SocialPost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

const RecentPosts = React.memo(function RecentPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await SocialPost.list("-created_date", 6);
        setPosts(data);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timer = setTimeout(() => {
      loadPosts();
    }, 4000);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600 select-none" />
              <p>No posts created yet</p>
            </div>
          ) : (
            posts.slice(0, 5).map((post) => (
              <div 
                key={post.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 dark:text-white truncate">{post.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{post.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default RecentPosts;