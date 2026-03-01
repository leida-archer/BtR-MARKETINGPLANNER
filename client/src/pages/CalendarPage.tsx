import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/uiStore";
import { getPlatformColor, getStatusColor } from "@/lib/constants";
import type { Post } from "@/types";

export function CalendarPage() {
  const filters = useUIStore((s) => s.filters);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const openPostDialog = useUIStore((s) => s.openPostDialog);
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (filters.platform) params.platform = filters.platform;
  if (filters.status) params.status = filters.status;
  if (filters.eventId) params.eventId = filters.eventId;
  if (searchQuery) params.search = searchQuery;

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", params],
    queryFn: () => api.getPosts(params),
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      api.reschedulePost(id, date),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const calendarEvents = useMemo(
    () =>
      posts
        .filter((p: Post) => p.scheduledDate)
        .map((p: Post) => ({
          id: p.id,
          title: p.title,
          start: p.scheduledDate!,
          backgroundColor: getPlatformColor(p.platform),
          borderColor: getStatusColor(p.status),
          extendedProps: { post: p },
        })),
    [posts]
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Calendar</h1>
      <div className="bg-surface border border-border rounded-xl p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={calendarEvents}
          editable={true}
          droppable={true}
          height="auto"
          eventClick={(info) => openPostDialog(info.event.id)}
          eventDrop={(info) => {
            const dateStr = info.event.startStr.split("T")[0];
            rescheduleMutation.mutate({ id: info.event.id, date: dateStr });
          }}
          eventContent={(arg) => {
            const post = arg.event.extendedProps.post as Post;
            return (
              <div className="flex items-center gap-1 px-1 py-0.5 text-xs overflow-hidden">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getPlatformColor(post.platform) }}
                />
                <span className="truncate">{post.title}</span>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
