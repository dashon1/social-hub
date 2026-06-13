import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HelpTooltip({ title, content, position = "top" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
          <HelpCircle className="h-4 w-4 text-slate-400 hover:text-slate-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent side={position} className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-sm text-slate-600">{content}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}