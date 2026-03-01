import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCountdown } from "@/hooks/useCountdown";
import { format } from "date-fns";
import { MapPin, Calendar, Plus, X, Sparkles } from "lucide-react";
import { getStatusColor, STATUSES } from "@/lib/constants";
import type { Event } from "@/types";

function EventCountdown({ date }: { date: string }) {
  const { label, isPast } = useCountdown(date);
  return (
    <span className={`text-xs font-mono ${isPast ? "text-foreground-muted" : "text-gold"}`}>
      {label}
    </span>
  );
}

function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const posts = event.posts as { id: string; status: string; platform: string }[];
  const statusCounts: Record<string, number> = {};
  posts.forEach((p) => {
    statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  });

  return (
    <div
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-surface border border-border rounded-xl p-5 hover:border-magenta/40 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {event.name}
        </h3>
        <EventCountdown date={event.date} />
      </div>

      <div className="flex items-center gap-4 text-sm text-foreground-muted mb-4">
        {event.venue && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {event.venue}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(event.date), "MMM d, yyyy")}
        </span>
      </div>

      {event.description && (
        <p className="text-sm text-foreground-muted mb-4 line-clamp-2">{event.description}</p>
      )}

      {/* Status progress bar */}
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden bg-ink">
        {STATUSES.map((s) => {
          const count = statusCounts[s.value] || 0;
          if (count === 0) return null;
          return (
            <div
              key={s.value}
              className="h-full"
              style={{
                backgroundColor: s.color,
                width: `${(count / posts.length) * 100}%`,
              }}
              title={`${s.label}: ${count}`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-foreground-muted">{posts.length} posts</span>
      </div>
    </div>
  );
}

export function EventsPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", venue: "", date: "", description: "" });
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: api.getEvents,
  });

  const createMutation = useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowForm(false);
      setFormData({ name: "", venue: "", date: "", description: "" });
    },
  });

  const fieldClass =
    "w-full bg-ink border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-magenta";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Events</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-magenta hover:bg-magenta/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Event"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <h3 className="font-heading text-lg font-semibold mb-4">Create Event</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate(formData);
            }}
            className="space-y-3"
          >
            <input type="text" placeholder="Event name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={fieldClass} required />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Venue" value={formData.venue} onChange={(e) => setFormData({ ...formData, venue: e.target.value })} className={fieldClass} />
              <input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className={fieldClass} required />
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={fieldClass + " min-h-[60px]"} />
            <button type="submit" className="bg-magenta hover:bg-magenta/90 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Create Event
            </button>
          </form>
        </div>
      )}

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((event: Event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {events.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 text-foreground-muted">
          <PartyPopper className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">No events yet</p>
          <p className="text-sm">Create your first event to get started</p>
        </div>
      )}
    </div>
  );
}

function PartyPopper(props: any) {
  return <Sparkles {...props} />;
}
