import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCountdown } from "@/hooks/useCountdown";
import { format, differenceInDays } from "date-fns";
import { MapPin, Calendar, ArrowLeft, Sparkles, Trash2 } from "lucide-react";
import { PostCard } from "@/components/posts/PostCard";
import { getStatusColor, getStatusLabel } from "@/lib/constants";
import type { Post } from "@/types";

function CountdownDisplay({ date }: { date: string }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(date);

  return (
    <div className="flex gap-3">
      {[
        { value: days, label: "DAYS" },
        { value: hours, label: "HRS" },
        { value: minutes, label: "MIN" },
        { value: seconds, label: "SEC" },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-ink border border-border rounded-lg px-3 py-2 min-w-[50px]">
            <span className={`font-mono text-xl font-bold ${isPast ? "text-foreground-muted" : "text-gold"}`}>
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-[10px] text-foreground-muted mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.getEvent(id!),
    enabled: !!id,
  });

  const generateMutation = useMutation({
    mutationFn: () => api.generateCampaign(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteEvent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/events");
    },
  });

  if (isLoading) {
    return <div className="text-foreground-muted">Loading...</div>;
  }

  if (!event) {
    return <div className="text-foreground-muted">Event not found</div>;
  }

  const posts = (event.posts || []) as Post[];
  const eventDate = new Date(event.date);

  // Group posts by T-offset
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : Infinity;
    const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : Infinity;
    return dateA - dateB;
  });

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      {/* Hero section */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">{event.name}</h1>
            <div className="flex items-center gap-4 text-sm text-foreground-muted mb-3">
              {event.venue && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(eventDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            {event.description && (
              <p className="text-foreground-muted max-w-xl">{event.description}</p>
            )}
          </div>
          <CountdownDisplay date={event.date} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="flex items-center gap-2 bg-gradient-to-r from-magenta to-orange text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generateMutation.isPending ? "Generating..." : "Generate Campaign"}
        </button>
        <span className="text-sm text-foreground-muted">
          {posts.length} posts in campaign
        </span>
        <button
          onClick={() => {
            if (confirm("Delete this event? Posts will be unlinked but not deleted.")) {
              deleteMutation.mutate();
            }
          }}
          className="ml-auto flex items-center gap-1 text-sm text-coral hover:bg-coral/10 px-3 py-2 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Event
        </button>
      </div>

      {/* Campaign timeline */}
      <h2 className="font-heading text-xl font-semibold mb-4">Campaign Timeline</h2>
      <div className="space-y-3">
        {sortedPosts.map((post) => {
          const postDate = post.scheduledDate ? new Date(post.scheduledDate) : null;
          const offset = postDate ? differenceInDays(postDate, eventDate) : null;
          const offsetLabel =
            offset !== null
              ? offset === 0
                ? "Day-of"
                : offset > 0
                ? `T+${offset}`
                : `T${offset}`
              : "Unscheduled";

          return (
            <div key={post.id} className="flex items-start gap-4">
              {/* Timeline marker */}
              <div className="flex flex-col items-center pt-3">
                <span
                  className="text-xs font-mono font-bold px-2 py-1 rounded"
                  style={{
                    backgroundColor: getStatusColor(post.status) + "20",
                    color: getStatusColor(post.status),
                  }}
                >
                  {offsetLabel}
                </span>
                <div className="w-px flex-1 bg-border mt-2" />
              </div>
              {/* Post card */}
              <div className="flex-1 pb-2">
                <PostCard post={post} />
              </div>
            </div>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <p className="text-lg mb-2">No posts in this campaign yet</p>
          <p className="text-sm">Click "Generate Campaign" to auto-create template posts</p>
        </div>
      )}
    </div>
  );
}
