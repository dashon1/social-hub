import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Crown,
  Zap,
  Rocket,
  Building2,
  ArrowUpDown,
  Loader2,
  UserCog,
} from "lucide-react";

const planOptions = [
  { id: "free", label: "Free Trial", icon: Zap, color: "bg-slate-100 text-slate-700" },
  { id: "pro", label: "Pro", icon: Crown, color: "bg-blue-100 text-blue-700" },
  { id: "elite", label: "Elite", icon: Rocket, color: "bg-purple-100 text-purple-700" },
  { id: "agency", label: "Agency", icon: Building2, color: "bg-orange-100 text-orange-700" },
];

function getPlanBadge(planId) {
  const plan = planOptions.find(p => p.id === planId) || planOptions[0];
  return <Badge className={`${plan.color} gap-1`}><plan.icon className="w-3 h-3" />{plan.label}</Badge>;
}

export default function UserPlanManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [newPlan, setNewPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await User.list("-created_date");
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!editUser || !newPlan) return;
    setSaving(true);
    try {
      await User.update(editUser.id, { subscription_plan: newPlan });
      toast({
        title: "Plan Updated",
        description: `${editUser.full_name || editUser.email} is now on the ${newPlan.toUpperCase()} plan.`,
        duration: 4000,
      });
      setEditUser(null);
      setNewPlan("");
      loadUsers();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update subscription plan.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      (u.full_name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="w-5 h-5 text-blue-600" />
                User Subscription Management
              </CardTitle>
              <CardDescription>
                Change any user's subscription plan — great for special offers or promotions
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No users found.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {user.full_name || "No Name"}
                        {user.role === "admin" && (
                          <Badge className="ml-2 bg-purple-100 text-purple-700 text-[10px]">Admin</Badge>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPlanBadge(user.subscription_plan || "free")}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditUser(user);
                        setNewPlan(user.subscription_plan || "free");
                      }}
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                      Change
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) { setEditUser(null); setNewPlan(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="font-medium text-slate-900">{editUser.full_name || "No Name"}</p>
                <p className="text-sm text-slate-500">{editUser.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">Current plan:</span>
                  {getPlanBadge(editUser.subscription_plan || "free")}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Plan</label>
                <Select value={newPlan} onValueChange={setNewPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {planOptions.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center gap-2">
                          <plan.icon className="w-4 h-4" />
                          {plan.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditUser(null); setNewPlan(""); }}>Cancel</Button>
            <Button onClick={handleChangePlan} disabled={saving || !newPlan || newPlan === (editUser?.subscription_plan || "free")}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Update Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}