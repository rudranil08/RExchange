import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default: "bg-[#F5F5F5] text-[#08090A] hover:bg-[#FFFFFF] active:bg-[#E5E5E5] font-semibold shadow-sm",
        secondary: "bg-[#111315] text-[#F5F5F5] hover:bg-[#16191D] border border-white/10 hover:border-white/20",
        outline: "border border-white/10 bg-transparent hover:bg-[#111315] text-[#F5F5F5] hover:border-white/20",
        ghost: "hover:bg-[#111315] text-[#8B8F96] hover:text-[#F5F5F5]",
        destructive: "border border-red-500/30 bg-[#111315] text-red-400 hover:bg-red-950/30 hover:border-red-500/50",
        accent: "bg-[#22C55E] text-[#08090A] font-semibold hover:bg-[#16A34A]",
      },
      size: {
        default: "h-9 px-4 py-2 text-xs font-semibold",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-sm font-semibold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
