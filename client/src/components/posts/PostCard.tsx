import { format } from "date-fns";
import { PlatformIcon } from "./PlatformIcon";
import { StatusBadge } from "./StatusBadge";
import { useUIStore } from "@/stores/uiStore";
import { getPriorityColor } from "@/lib/constants";
import { Image } from "lucide-react";
import type { Post } from "@/types";

export function PostCard({ post }: { post: Post }) {
  const openPostDialog = useUIStore((s) => s.openPostDialog);

  return (
    <div
      onClick={() => openPostDialog(post.id)}
      className="bg-surface border border-border rounded-lg p-3 hover:border-magenta/40 transition-colors cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <PlatformIcon platform={post.platform} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-foreground truncate">
              {post.title}
            </h4>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getPriorityColor(post.priority) }}
              title={post.priority}
            />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={post.status} />
            {post.assets.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-foreground-muted">
                <Image className="w-3 h-3" />
                {post.assets.length}
              </span>
            )}
            {post.scheduledDate && (
              <span className="text-xs text-foreground-muted">
                {format(new Date(post.scheduledDate), "MMM d")}
                {post.scheduledTime && ` ${post.scheduledTime}`}
              </span>
            )}
          </div>
          {post.event && (
            <span className="inline-block mt-1.5 text-xs text-magenta/80 bg-magenta/10 px-1.5 py-0.5 rounded">
              {post.event.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
