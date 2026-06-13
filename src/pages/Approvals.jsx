import React, { useState, useEffect } from "react";
import { SocialPost } from "@/entities/SocialPost";
import { User } from "@/entities/User";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import ApprovalCard from "../components/approvals/ApprovalCard.jsx";

export default function Approvals() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      setIsAdmin(user.role === 'admin');

      if (user.role === 'admin') {
        const posts = await SocialPost.filter({ status: "pending_approval" }, "-created_date");
        setPendingPosts(posts);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPendingPosts(prev => prev.filter(p => p.id !== updatedPost.id));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
          <p className="text-slate-600">
            Only administrators can access the approval management page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Toaster />
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Content Approvals</h1>
        <p className="text-slate-600">Review and approve posts submitted by your team</p>
      </div>

      {pendingPosts.length === 0 ? (
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
          <p className="text-slate-600">
            There are no posts pending approval at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingPosts.map(post => (
            <ApprovalCard key={post.id} post={post} onUpdate={handlePostUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}