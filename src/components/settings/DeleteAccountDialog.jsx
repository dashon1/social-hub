import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function DeleteAccountDialog() {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      // Log the user out after account deletion request
      base44.auth.logout("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      setDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="min-h-[44px] select-none w-full sm:w-auto"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white">
            Delete your account?
          </AlertDialogTitle>
          <AlertDialogDescription className="dark:text-slate-400">
            This action is permanent and cannot be undone. All your posts,
            analytics, and data will be permanently removed. Type{" "}
            <span className="font-bold text-red-600">DELETE</span> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          placeholder='Type "DELETE" to confirm'
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="dark:bg-slate-800 dark:border-slate-600 dark:text-white"
        />
        <AlertDialogFooter>
          <AlertDialogCancel className="min-h-[44px] select-none dark:bg-slate-800 dark:text-white dark:border-slate-600">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || deleting}
            className="min-h-[44px] select-none bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Permanently Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}