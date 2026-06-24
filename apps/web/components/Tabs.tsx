"use client";
import * as TabsPrim from "@radix-ui/react-tabs";
import { cn } from "@traderiq/ui";

export const Tabs = TabsPrim.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrim.List>) {
  return (
    <TabsPrim.List
      className={cn(
        "no-scrollbar -mx-1 flex h-auto min-h-10 items-center justify-start gap-1 overflow-x-auto rounded-md bg-muted/60 p-1 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrim.Trigger>) {
  return (
    <TabsPrim.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrim.Content>) {
  return (
    <TabsPrim.Content
      className={cn(
        "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
