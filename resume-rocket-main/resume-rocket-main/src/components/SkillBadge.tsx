import { cn } from "@/lib/utils";

interface SkillBadgeProps {
  skill: string;
  variant: "found" | "missing";
}

const SkillBadge = ({ skill, variant }: SkillBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize transition-all animate-scale-in",
      variant === "found"
        ? "bg-success/10 text-success border border-success/20"
        : "bg-destructive/10 text-destructive border border-destructive/20"
    )}
  >
    {variant === "found" ? "✓ " : "✗ "}
    {skill}
  </span>
);

export default SkillBadge;
