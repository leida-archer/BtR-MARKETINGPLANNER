import { cn } from "@/lib/utils";
import { getPlatformColor } from "@/lib/constants";

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "IG",
  tiktok: "TT",
  x: "X",
  reddit: "R",
};

export function PlatformIcon({
  platform,
  size = "sm",
}: {
  platform: string;
  size?: "sm" | "md" | "lg";
}) {
  const color = getPlatformColor(platform);
  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  return (
    <div
      className={cn(
        "rounded-md flex items-center justify-center font-bold shrink-0",
        sizeClasses[size]
      )}
      style={{ backgroundColor: color + "20", color }}
    >
      {PLATFORM_ICONS[platform] || "?"}
    </div>
  );
}
