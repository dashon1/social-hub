import React, { useState, useEffect, useCallback } from "react";
import { SocialInbox } from "@/entities/SocialInbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Inbox, MessageCircle, Send } from "lucide-react";
import PullToRefresh from "../components/mobile/PullToRefresh";

export default function SmartInbox() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await SocialInbox.list("-received_date", 50);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedMessage || !response) return;

    // Optimistic update
    const previousMessage = { ...selectedMessage };
    const updatedMessage = { ...selectedMessage, status: "responded", response };
    setSelectedMessage(updatedMessage);
    setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updatedMessage : m));
    setResponse("");

    try {
      await SocialInbox.update(selectedMessage.id, {
        status: "responded",
        response: previousMessage.id ? response : response
      });
    } catch (error) {
      console.error("Error responding:", error);
      // Revert on failure
      setSelectedMessage(previousMessage);
      setMessages(prev => prev.map(m => m.id === previousMessage.id ? previousMessage : m));
      setResponse(response);
    }
  };

  const statusColors = {
    unread: "bg-blue-100 text-blue-800",
    read: "bg-gray-100 text-gray-800",
    responded: "bg-green-100 text-green-800",
    archived: "bg-slate-100 text-slate-800"
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800"
  };

  const handlePullRefresh = useCallback(async () => {
    await loadMessages();
  }, []);

  return (
    <PullToRefresh onRefresh={handlePullRefresh}>
    <div className="p-4 md:p-6 space-y-6" style={{ overscrollBehaviorY: "none" }}>
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Inbox className="w-8 h-8 text-indigo-600 select-none" />
          Smart Inbox
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Manage all social conversations in one place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg dark:text-white">Messages</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No messages yet</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 border-b dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 min-h-[44px] ${
                      selectedMessage?.id === msg.id ? "bg-blue-50 dark:bg-blue-950" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">@{msg.from_user}</p>
                      <Badge className={`text-xs ${statusColors[msg.status]}`}>{msg.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{msg.message_text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs capitalize dark:border-slate-600 dark:text-slate-300">{msg.platform}</Badge>
                      <Badge className={`text-xs ${priorityColors[msg.priority]}`}>{msg.priority}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                  <div>
                    <CardTitle className="dark:text-white">Message from @{selectedMessage.from_user}</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize mt-1">
                      {selectedMessage.platform} • {selectedMessage.message_type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={statusColors[selectedMessage.status]}>{selectedMessage.status}</Badge>
                    <Badge className={priorityColors[selectedMessage.priority]}>{selectedMessage.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-slate-800 dark:text-slate-200">{selectedMessage.message_text}</p>
                </div>

                {selectedMessage.response && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Your Response:</p>
                    <p className="text-slate-800 dark:text-slate-200">{selectedMessage.response}</p>
                  </div>
                )}

                {selectedMessage.status !== "responded" && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Write your response..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                      className="dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                    />
                    <Button onClick={handleRespond} className="w-full bg-indigo-600 hover:bg-indigo-700 min-h-[44px] select-none">
                      <Send className="w-4 h-4 mr-2 select-none" />
                      Send Response
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="p-12 text-center">
                <Inbox className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Select a Message</h3>
                <p className="text-slate-600 dark:text-slate-400">Choose a message from the list to view and respond</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
}