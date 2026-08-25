import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#171717] text-white",
        secondary:
          "border-[#E4E1D9] bg-[#F7F6F2] text-[#6B6B65]",
        outline:
          "text-[#171717] border-[#E4E1D9] bg-white",
        offer:
          "border-[#087F5B]/25 bg-[#E8F5EF] text-[#087F5B] font-medium",
        need:
          "border-[#7048E8]/25 bg-[#F0EBFF] text-[#7048E8] font-medium",
        match:
          "border-[#C58A00]/30 bg-[#FFF6D8] text-[#9A6B00] font-semibold",
        category:
          "border-[#E4E1D9] bg-[#F0EFEA] text-[#171717] font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
