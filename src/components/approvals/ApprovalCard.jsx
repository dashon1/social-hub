import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SocialPost } from "@/entities/SocialPost";
import { useToast } from "@/components/ui/use-toast";
import { sendNotification } from "../notifications/NotificationCenter";
import {
  CheckCircle,
  XCircle,
  Calendar,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from "lucide-react";

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  youtube: Youtube,
  tiktok: MessageSquare
};

const platformColors = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  twitter: "bg-sky-500",
  linkedin: "bg-blue-700",
  youtube: "bg-red-600",
  tiktok: "bg-black"
};

export default function ApprovalCard({ post, onUpdate }) {
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setProcessing(true);
    try {
      const updated = await SocialPost.update(post.id, {
        status: "approved",
        approval_notes: notes,
        approval_date: new Date().toISOString()
      });

      toast({
        title: "Post Approved",
        description: "The post has been approved and is ready for publishing.",
      });

      sendNotification({
        title: "Post Approved",
        message: `"${post.title}" has been approved.`,
        type: "success"
      });

      onUpdate(updated);
    } catch (error) {
      console.error("Error approving post:", error);
      toast({
        title: "Error",
        description: "Failed to approve post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const updated = await SocialPost.update(post.id, {
        status: "rejected",
        approval_notes: notes,
        approval_date: new Date().toISOString()
      });

      toast({
        title: "Post Rejected",
        description: "The post has been rejected and returned to the author.",
      });

      sendNotification({
        title: "Post Rejected",
        message: `"${post.title}" has been rejected.`,
        type: "warning"
      });

      onUpdate(updated);
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast({
        title: "Error",
        description: "Failed to reject post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const PlatformIcon = platformIcons[post.platform];
  const platformColor = platformColors[post.platform];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${platformColor}`}>
              {PlatformIcon && <PlatformIcon className="w-5 h-5 text-white" />}
            </div>
            <div>
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <p className="text-sm text-slate-500 capitalize">{post.platform}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending Review
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Content:</p>
          <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
            {post.content}
          </p>
        </div>

        {post.hashtags && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Hashtags:</p>
            <p className="text-slate-600 text-sm">{post.hashtags}</p>
          </div>
        )}

        {post.scheduled_date && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Scheduled: {new Date(post.scheduled_date).toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MessageSquare className="w-4 h-4" />
          <span>Created by: {post.created_by}</span>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Approval Notes (Optional):</p>
          <Textarea
            placeholder="Add notes or feedback for the author..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={handleReject}
            disabled={processing}
            variant="outline"
            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}