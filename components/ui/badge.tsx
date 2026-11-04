import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "pink" | "gold" | "green" | "blue" | "purple" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  default: "bg-zumi-surface-2 text-zumi-2 border border-zumi",
  pink: "bg-pink-500/15 text-pink-400 border border-pink-500/30",
  gold: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  blue: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  outline: "border border-zumi-2 text-zumi-2",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  );
}
