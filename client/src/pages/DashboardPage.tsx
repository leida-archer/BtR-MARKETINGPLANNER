import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format, isAfter, addDays, startOfDay } from "date-fns";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { getStatusColor, getPlatformColor, getPlatformLabel } from "@/lib/constants";
import type { Post, Stats, HeatmapEntry, Conflict } from "@/types";
import { useMemo } from "react";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-heading font-bold">{value}</p>
          <p className="text-xs text-foreground-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}

function HeatmapView({ data }: { data: HeatmapEntry[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const dateMap = new Map(data.map((d) => [d.date, d.count]));

  // Generate last 90 days
  const cells = useMemo(() => {
    const today = startOfDay(new Date());
    const result = [];
    for (let i = 89; i >= 0; i--) {
      const d = addDays(today, -i);
      const dateStr = format(d, "yyyy-MM-dd");
      const count = dateMap.get(dateStr) || 0;
      result.push({ date: dateStr, count, dayOfWeek: d.getDay() });
    }
    return result;
  }, [data]);

  function getColor(count: number): string {
    if (count === 0) return "var(--color-charcoal)";
    const ratio = count / maxCount;
    if (ratio < 0.33) return "#D6246E40";
    if (ratio < 0.66) return "#E8652B80";
    return "#F2A922";
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-gold" />
        Content Density (90 days)
      </h3>
      <div className="flex flex-wrap gap-1">
        {cells.map((cell) => (
          <div
            key={cell.date}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getColor(cell.count) }}
            title={`${cell.date}: ${cell.count} post${cell.count !== 1 ? "s" : ""}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-foreground-muted">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "var(--color-charcoal)" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#D6246E40" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#E8652B80" }} />
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F2A922" }} />
        <span>More</span>
      </div>
    </div>
  );
}

function ConflictAlerts({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) return null;

  return (
    <div className="bg-surface border border-coral/30 rounded-xl p-5">
      <h3 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2 text-coral">
        <AlertTriangle className="w-4 h-4" />
        Scheduling Conflicts ({conflicts.length})
      </h3>
      <div className="space-y-2">
        {conflicts.slice(0, 5).map((c, i) => (
          <div key={i} className="text-xs text-foreground-muted">
            <span className="text-coral font-medium">{getPlatformLabel(c.platform)}</span>
            {" — "}
            {c.scheduledDate} at {c.scheduledTime}
            {": "}
            {c.posts.map((p) => p.title).join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["analytics", "stats"],
    queryFn: api.getStats,
  });
  const { data: heatmap = [] } = useQuery<HeatmapEntry[]>({
    queryKey: ["analytics", "heatmap"],
    queryFn: () => api.getHeatmap(90),
  });
  const { data: conflicts = [] } = useQuery<Conflict[]>({
    queryKey: ["analytics", "conflicts"],
    queryFn: api.getConflicts,
  });
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: () => api.getPosts(),
  });

  // Get upcoming posts (next 7 days)
  const upcomingPosts = useMemo(() => {
    const now = new Date();
    const weekFromNow = addDays(now, 7);
    return posts
      .filter(
        (p: Post) =>
          p.scheduledDate &&
          isAfter(new Date(p.scheduledDate), now) &&
          !isAfter(new Date(p.scheduledDate), weekFromNow) &&
          p.status !== "posted"
      )
      .sort(
        (a: Post, b: Post) =>
          new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime()
      );
  }, [posts]);

  const inProduction = stats?.byStatus?.["in_production"] || 0;
  const posted = stats?.byStatus?.["posted"] || 0;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Total Posts" value={stats?.total || 0} color="#8B5CF6" />
        <StatCard icon={Clock} label="Upcoming" value={stats?.upcoming || 0} color="#3B82F6" />
        <StatCard icon={TrendingUp} label="In Production" value={inProduction} color="#F59E0B" />
        <StatCard icon={CheckCircle} label="Posted" value={posted} color="#22C55E" />
      </div>

      {/* Heatmap + Conflicts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <HeatmapView data={heatmap} />
        <ConflictAlerts conflicts={conflicts} />
      </div>

      {/* Upcoming posts */}
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="font-heading text-sm font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Upcoming Posts (Next 7 Days)
        </h3>
        {upcomingPosts.length > 0 ? (
          <div className="space-y-2">
            {upcomingPosts.map((post: Post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground-muted py-4 text-center">
            No posts scheduled for the next 7 days
          </p>
        )}
      </div>
    </div>
  );
}
