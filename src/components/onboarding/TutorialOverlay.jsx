import React, { useState, useEffect } from 'react';
import { User } from "@/entities/User";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Users,
  CheckCircle
} from "lucide-react";

const tutorialSteps = [
  {
    title: "Welcome to SocialHub! 🎉",
    description: "Let's take a quick tour to help you get started with managing your social media content.",
    icon: Sparkles
  },
  {
    title: "Dashboard Overview",
    description: "Your dashboard shows key metrics, recent posts, and platform performance. Use 'Sync Analytics' to update your stats.",
    icon: BarChart3
  },
  {
    title: "Create Your First Post",
    description: "Click 'Create Post' to start crafting content. Use AI to generate text, suggest hashtags, and find the best posting times!",
    icon: Sparkles
  },
  {
    title: "Content Calendar",
    description: "Plan your content strategy with the visual calendar. See all your scheduled posts at a glance and collaborate with comments.",
    icon: Calendar
  },
  {
    title: "Team Collaboration",
    description: "Submit posts for approval, leave comments, and work together with your team. Admins can review and approve content before it goes live.",
    icon: Users
  },
  {
    title: "You're All Set!",
    description: "You're ready to start managing your social media presence. Explore the features and reach out if you need help!",
    icon: CheckCircle
  }
];

export default function TutorialOverlay({ currentUser, onUpdateUser }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentUser && !currentUser.onboarding_completed && !currentUser.tutorial_dismissed) {
      setOpen(true);
      setCurrentStep(currentUser.onboarding_step || 0);
    }
  }, [currentUser]);

  const handleNext = async () => {
    const nextStep = currentStep + 1;
    
    if (nextStep >= tutorialSteps.length) {
      // Complete tutorial
      setOpen(false);
      setTimeout(async () => {
        await User.updateMyUserData({
          onboarding_completed: true,
          onboarding_step: tutorialSteps.length
        });
        if (onUpdateUser) setTimeout(onUpdateUser, 500);
      }, 500);
    } else {
      setCurrentStep(nextStep);
      setTimeout(async () => {
        await User.updateMyUserData({
          onboarding_step: nextStep
        });
      }, 500);
    }
  };

  const handleSkip = async () => {
    setOpen(false);
    setTimeout(async () => {
      await User.updateMyUserData({
        tutorial_dismissed: true
      });
      if (onUpdateUser) setTimeout(onUpdateUser, 500);
    }, 500);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const IconComponent = step?.icon;
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {IconComponent && (
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
            )}
            <div className="flex-1">
              <DialogTitle className="text-xl">{step?.title}</DialogTitle>
              <p className="text-sm text-slate-500">Step {currentStep + 1} of {tutorialSteps.length}</p>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </DialogHeader>
        <DialogDescription className="text-base text-slate-700 py-4">
          {step?.description}
        </DialogDescription>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="bg-gradient-to-r from-blue-600 to-purple-600">
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}