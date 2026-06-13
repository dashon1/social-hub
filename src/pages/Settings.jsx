import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from '@/entities/User';
import { sendNotification } from '../components/notifications/NotificationCenter';
import DeleteAccountDialog from '../components/settings/DeleteAccountDialog';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Save,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin
};

export default function Settings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      approvals: true,
      mentions: true,
      analytics: false
    },
    privacy: {
      showEmail: false,
      allowInvites: true,
      dataSharing: false
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York'
    }
  });

  const [connectedPlatforms] = useState({
    instagram: true,
    facebook: true,
    twitter: false,
    linkedin: true
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // Load saved settings
        if (user.settings) {
          setSettings(prev => ({ ...prev, ...user.settings }));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    setTimeout(loadUser, 2500);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({ settings });
      sendNotification({
        title: 'Settings Saved',
        message: 'Your preferences have been updated successfully.',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      sendNotification({
        title: 'Save Failed',
        message: 'Could not save your settings. Please try again.',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updatePrivacySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value }
    }));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account and application preferences</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={saving} className="min-h-[44px] select-none">
          <Save className="w-4 h-4 mr-2 select-none" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="account" className="min-h-[44px] select-none">Account</TabsTrigger>
          <TabsTrigger value="notifications" className="min-h-[44px] select-none">Notifications</TabsTrigger>
          <TabsTrigger value="privacy" className="min-h-[44px] select-none">Privacy</TabsTrigger>
          <TabsTrigger value="platforms" className="min-h-[44px] select-none">Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Profile Information</CardTitle>
              <CardDescription className="dark:text-slate-400">Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Full Name</Label>
                <Input value={currentUser?.full_name || ''} disabled className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Email</Label>
                <Input value={currentUser?.email || ''} disabled className="dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
              </div>
              <div className="space-y-2">
                <Label className="dark:text-slate-300">Role</Label>
                <Input value={currentUser?.role || ''} disabled className="capitalize dark:bg-slate-900 dark:border-slate-600 dark:text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription className="dark:text-slate-400">Permanently delete your account and all associated data</CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="dark:text-white">Notification Preferences</CardTitle>
                  <CardDescription className="dark:text-slate-400">Choose what you want to be notified about</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Email Notifications</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(val) => updateNotificationSetting('email', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Push Notifications</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Browser push notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(val) => updateNotificationSetting('push', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Approval Requests</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Get notified when posts need approval</p>
                </div>
                <Switch
                  checked={settings.notifications.approvals}
                  onCheckedChange={(val) => updateNotificationSetting('approvals', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Social Mentions</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Alerts for brand mentions</p>
                </div>
                <Switch
                  checked={settings.notifications.mentions}
                  onCheckedChange={(val) => updateNotificationSetting('mentions', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Analytics Reports</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Weekly analytics summaries</p>
                </div>
                <Switch
                  checked={settings.notifications.analytics}
                  onCheckedChange={(val) => updateNotificationSetting('analytics', val)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="dark:text-white">Privacy & Security</CardTitle>
                  <CardDescription className="dark:text-slate-400">Control your data and privacy settings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Show Email to Team</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Allow team members to see your email</p>
                </div>
                <Switch
                  checked={settings.privacy.showEmail}
                  onCheckedChange={(val) => updatePrivacySetting('showEmail', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Allow Team Invites</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Let others invite you to their teams</p>
                </div>
                <Switch
                  checked={settings.privacy.allowInvites}
                  onCheckedChange={(val) => updatePrivacySetting('allowInvites', val)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-white">Data Sharing</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Share anonymized data to improve the platform</p>
                </div>
                <Switch
                  checked={settings.privacy.dataSharing}
                  onCheckedChange={(val) => updatePrivacySetting('dataSharing', val)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card className="border-0 shadow-lg dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Connected Platforms</CardTitle>
              <CardDescription className="dark:text-slate-400">Manage your social media connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(connectedPlatforms).map(([platform, connected]) => {
                const IconComponent = platformIcons[platform];
                return (
                  <div key={platform} className="flex items-center justify-between p-4 border dark:border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-6 h-6 dark:text-slate-300" />
                      <div>
                        <p className="font-medium capitalize dark:text-white">{platform}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {connected ? 'Connected and active' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {connected ? (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="min-h-[44px] select-none dark:border-slate-600 dark:text-white">
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}