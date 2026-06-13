import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { testBlotatoConnection } from "@/functions/testBlotatoConnection";
import UserPlanManager from "../components/admin/UserPlanManager.jsx";
import {
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  MessageSquare,
  Globe,
  Bookmark,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Key,
  Link2,
  AlertTriangle,
  Info
} from "lucide-react";

const platformConfigs = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "from-purple-500 via-pink-500 to-orange-500", envKey: "BLOTATO_INSTAGRAM_ACCOUNT_ID" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "from-blue-600 to-blue-700", envKey: "BLOTATO_FACEBOOK_ACCOUNT_ID" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "from-sky-500 to-sky-600", envKey: "BLOTATO_TWITTER_ACCOUNT_ID" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "from-blue-700 to-blue-800", envKey: "BLOTATO_LINKEDIN_ACCOUNT_ID" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "from-red-600 to-red-700", envKey: "BLOTATO_YOUTUBE_ACCOUNT_ID" },
  { id: "tiktok", name: "TikTok", icon: MessageSquare, color: "from-black to-gray-800", envKey: "BLOTATO_TIKTOK_ACCOUNT_ID" },
  { id: "bluesky", name: "Bluesky", icon: Globe, color: "from-blue-400 to-blue-500", envKey: "BLOTATO_BLUESKY_ACCOUNT_ID" },
  { id: "pinterest", name: "Pinterest", icon: Bookmark, color: "from-red-500 to-red-600", envKey: "BLOTATO_PINTEREST_ACCOUNT_ID" },
];

export default function PlatformSetup() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(null);
  const [connectionResults, setConnectionResults] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to fetch user", e);
      } finally {
        setLoading(false);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTestConnection = async (platformId) => {
    setTesting(platformId);
    try {
      const { data } = await testBlotatoConnection({ platform: platformId });
      setConnectionResults(prev => ({
        ...prev,
        [platformId]: { success: data.connected, message: data.message }
      }));
      toast({
        title: data.connected ? "Connected!" : "Not Connected",
        description: data.message,
        variant: data.connected ? "default" : "destructive",
        duration: 4000,
      });
    } catch (error) {
      setConnectionResults(prev => ({
        ...prev,
        [platformId]: { success: false, message: error.message || "Test failed" }
      }));
      toast({
        title: "Test Failed",
        description: "Could not test connection. Check your configuration.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setTesting(null);
    }
  };

  const handleTestAll = async () => {
    for (const platform of platformConfigs) {
      await handleTestConnection(platform.id);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Access Required</h2>
            <p className="text-slate-600">Only administrators can configure platform connections.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Toaster />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Link2 className="w-8 h-8 text-blue-600" />
            Platform Connections
          </h1>
          <p className="text-slate-600">
            Connect social media accounts so posts can be published from SocialHub
          </p>
        </div>
        <Button onClick={handleTestAll} variant="outline">
          Test All Connections
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Connection Status</TabsTrigger>
          <TabsTrigger value="setup">Setup Guide</TabsTrigger>
          <TabsTrigger value="users">User Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900 mb-1">How Platform Connections Work</p>
                  <p className="text-sm text-slate-700">
                    SocialHub publishes posts through <strong>Blotato</strong>, a social media publishing service.
                    Each social media account needs to be connected in your Blotato dashboard first, then linked here using
                    the Account ID. You can either set up Blotato accounts for your clients, or have them create their own
                    and share the Account IDs with you.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformConfigs.map((platform) => {
              const Icon = platform.icon;
              const result = connectionResults[platform.id];
              const isTesting = testing === platform.id;

              return (
                <Card key={platform.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-r ${platform.color} shadow-sm`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{platform.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{platform.envKey}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {result && !isTesting && (
                          result.success ? (
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <CheckCircle className="w-3 h-3" /> Connected
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 gap-1">
                              <XCircle className="w-3 h-3" /> Not Connected
                            </Badge>
                          )
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestConnection(platform.id)}
                          disabled={isTesting}
                        >
                          {isTesting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Test"
                          )}
                        </Button>
                      </div>
                    </div>

                    {result && result.message && !result.success && (
                      <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">
                        {result.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                Option 1: We Set Up Accounts for Clients
              </CardTitle>
              <CardDescription>
                You create and manage Blotato accounts on behalf of your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <StepItem number={1} title="Create a Blotato Account">
                  Go to <a href="https://blotato.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">blotato.com <ExternalLink className="w-3 h-3" /></a> and
                  sign up for an account. This will be the master account used for publishing.
                </StepItem>
                <StepItem number={2} title="Connect Social Accounts in Blotato">
                  In your Blotato dashboard, connect each social media platform (Instagram, Facebook, Twitter, etc.)
                  that you want to publish to. Each connection will generate a unique <strong>Account ID</strong>.
                </StepItem>
                <StepItem number={3} title="Copy API Key">
                  Find your Blotato API Key in the Blotato dashboard under Settings → API. This key is already configured
                  as <code className="bg-slate-100 px-1 rounded text-xs">BLOTATO_API_KEY</code> in this app.
                </StepItem>
                <StepItem number={4} title="Enter Account IDs">
                  For each connected platform, copy the Account ID from Blotato and enter it in the app's environment
                  variables (Dashboard → Settings → Environment Variables). The variable names are shown on the
                  Connection Status tab.
                </StepItem>
                <StepItem number={5} title="Test Connections">
                  Use the "Test" buttons on the Connection Status tab to verify each platform is properly connected.
                </StepItem>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-blue-500" />
                Option 2: Clients Connect Their Own Accounts
              </CardTitle>
              <CardDescription>
                Clients set up their own Blotato accounts and share the Account IDs with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <StepItem number={1} title="Client Signs Up for Blotato">
                  Have the client create their own account at <a href="https://blotato.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">blotato.com <ExternalLink className="w-3 h-3" /></a>.
                </StepItem>
                <StepItem number={2} title="Client Connects Their Social Accounts">
                  The client connects their Instagram, Facebook, Twitter, etc. in their Blotato dashboard.
                </StepItem>
                <StepItem number={3} title="Client Shares Account IDs">
                  The client shares their Blotato Account IDs for each platform with you.
                  You then enter these IDs in the environment variables.
                </StepItem>
                <StepItem number={4} title="Configure & Test">
                  Enter the Account IDs in the app's environment variables and test each connection.
                </StepItem>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-800 text-sm">Important Note</p>
                  <p className="text-sm text-amber-700">
                    Both options require the Blotato API Key to be configured. The API Key authenticates all
                    publishing requests regardless of which Account IDs are used.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-3">Environment Variables Reference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 border">
                  <code className="text-xs font-mono text-blue-700">BLOTATO_API_KEY</code>
                  <p className="text-xs text-slate-500 mt-1">Master API key for authentication</p>
                </div>
                {platformConfigs.map(p => (
                  <div key={p.id} className="bg-white rounded-lg p-3 border">
                    <code className="text-xs font-mono text-blue-700">{p.envKey}</code>
                    <p className="text-xs text-slate-500 mt-1">{p.name} account ID</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <UserPlanManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StepItem({ number, title, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
        {number}
      </div>
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-600 mt-0.5">{children}</p>
      </div>
    </div>
  );
}