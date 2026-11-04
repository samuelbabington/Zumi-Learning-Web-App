import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, fullWidth, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          variant === "primary" && "btn-primary text-white",
          variant === "secondary" && "btn-secondary",
          variant === "ghost" && "text-zumi-2 hover:bg-zumi-surface-2 hover:text-zumi rounded-lg",
          variant === "danger" && "bg-red-500 hover:bg-red-600 text-white rounded-lg",
          size === "sm" && "h-8 px-3 text-sm rounded-lg",
          size === "md" && "h-10 px-4 text-sm rounded-xl",
          size === "lg" && "h-12 px-6 text-base rounded-xl",
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : children}
      </button>
    );
  }
);
Button.displayName = "Button";
