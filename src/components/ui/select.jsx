"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

import { cn } from "@/lib/utils"

const SelectMobileContext = React.createContext({ isMobile: false, onValueChange: null, value: null });

const Select = ({ children, value, onValueChange, defaultValue, ...props }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <SelectMobileContext.Provider value={{ isMobile: true, onValueChange, value: value || defaultValue }}>
        <Drawer>
          {children}
        </Drawer>
      </SelectMobileContext.Provider>
    );
  }

  return (
    <SelectMobileContext.Provider value={{ isMobile: false }}>
      <SelectPrimitive.Root value={value} onValueChange={onValueChange} defaultValue={defaultValue} {...props}>
        {children}
      </SelectPrimitive.Root>
    </SelectMobileContext.Provider>
  );
};

const SelectGroup = React.forwardRef(({ children, ...props }, ref) => {
  const { isMobile } = React.useContext(SelectMobileContext);
  if (isMobile) return <div ref={ref} {...props}>{children}</div>;
  return <SelectPrimitive.Group ref={ref} {...props}>{children}</SelectPrimitive.Group>;
});
SelectGroup.displayName = "SelectGroup";

const SelectValue = React.forwardRef(({ placeholder, className, ...props }, ref) => {
  const { isMobile, value } = React.useContext(SelectMobileContext);
  if (isMobile) {
    return <span ref={ref} className={cn("text-sm", !value && "text-muted-foreground", className)} {...props}>{value || placeholder}</span>;
  }
  return <SelectPrimitive.Value ref={ref} placeholder={placeholder} className={className} {...props} />;
});
SelectValue.displayName = "SelectValue";

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { isMobile } = React.useContext(SelectMobileContext);

  const triggerClasses = cn(
    "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
    className
  );

  if (isMobile) {
    return (
      <DrawerTrigger ref={ref} className={triggerClasses} {...props}>
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </DrawerTrigger>
    );
  }

  return (
    <SelectPrimitive.Trigger ref={ref} className={triggerClasses} {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}>
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => {
  const { isMobile } = React.useContext(SelectMobileContext);

  if (isMobile) {
    return (
      <DrawerContent ref={ref} className={cn("px-4 pb-6", className)}>
        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </DrawerContent>
    );
  }

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});
SelectContent.displayName = "SelectContent";

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { isMobile } = React.useContext(SelectMobileContext);
  if (isMobile) {
    return <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />;
  }
  return (
    <SelectPrimitive.Label
      ref={ref}
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props} />
  );
});
SelectLabel.displayName = "SelectLabel";

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const ctx = React.useContext(SelectMobileContext);

  if (ctx.isMobile) {
    const isSelected = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-lg py-3 pl-3 pr-8 text-sm outline-none active:bg-accent transition-colors",
          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
          className
        )}
        onClick={() => ctx.onValueChange?.(value)}
        {...props}
      >
        <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        {children}
      </button>
    );
  }

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      value={value}
      {...props}>
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = "SelectItem";

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => {
  const { isMobile } = React.useContext(SelectMobileContext);
  if (isMobile) {
    return <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
  }
  return (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props} />
  );
});
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}