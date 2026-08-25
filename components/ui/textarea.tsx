import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[70px] w-full rounded-md border border-[#242832] bg-[#0E1013] px-3 py-2 text-xs text-[#F5F5F7] placeholder:text-[#70747D] transition-colors focus-visible:outline-none focus-visible:border-[#8B5CF6] focus-visible:ring-1 focus-visible:ring-[#8B5CF6]/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
