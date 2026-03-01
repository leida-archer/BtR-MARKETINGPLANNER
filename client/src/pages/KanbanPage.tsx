import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/uiStore";
import { STATUSES } from "@/lib/constants";
import { PostCard } from "@/components/posts/PostCard";
import type { Post, Status } from "@/types";

function SortablePostCard({ post }: { post: Post }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PostCard post={post} />
    </div>
  );
}

function KanbanColumn({
  status,
  label,
  color,
  posts,
}: {
  status: string;
  label: string;
  color: string;
  posts: Post[];
}) {
  const ids = posts.map((p) => p.id);

  return (
    <div className="flex flex-col min-w-[260px] w-[260px] shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        <span className="ml-auto text-xs text-foreground-muted bg-surface px-2 py-0.5 rounded-full">
          {posts.length}
        </span>
      </div>

      {/* Droppable area */}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className="flex-1 space-y-2 min-h-[200px] p-2 rounded-lg bg-ink/50 border border-border/50"
          data-status={status}
        >
          {posts.map((post) => (
            <SortablePostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <div className="flex items-center justify-center h-20 text-xs text-foreground-muted">
              Drop posts here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanPage() {
  const filters = useUIStore((s) => s.filters);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const params: Record<string, string> = {};
  if (filters.platform) params.platform = filters.platform;
  if (filters.eventId) params.eventId = filters.eventId;
  if (searchQuery) params.search = searchQuery;

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", params],
    queryFn: () => api.getPosts(params),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, sortOrder }: { id: string; status: string; sortOrder?: number }) =>
      api.updatePostStatus(id, status, sortOrder),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const columnPosts = useMemo(() => {
    const map: Record<string, Post[]> = {};
    for (const s of STATUSES) {
      map[s.value] = posts
        .filter((p: Post) => p.status === s.value)
        .sort((a: Post, b: Post) => a.sortOrder - b.sortOrder);
    }
    return map;
  }, [posts]);

  const activePost = activeId ? posts.find((p: Post) => p.id === activeId) : null;

  function findColumnForId(id: string): string | null {
    // Check if id is a post id
    for (const [status, items] of Object.entries(columnPosts)) {
      if (items.some((p) => p.id === id)) return status;
    }
    // Check if id is a status (column droppable)
    if (STATUSES.some((s) => s.value === id)) return id;
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeColumn = findColumnForId(active.id as string);
    let overColumn = findColumnForId(over.id as string);

    // If we dropped on a column area directly
    if (!overColumn && over.id) {
      const statusVal = (over as any).data?.current?.sortable?.containerId;
      if (statusVal) overColumn = statusVal;
    }

    if (!activeColumn || !overColumn) return;

    if (activeColumn !== overColumn) {
      // Moved to a different column — update status
      statusMutation.mutate({
        id: active.id as string,
        status: overColumn,
        sortOrder: 0,
      });
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Pipeline</h1>
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4">
            {STATUSES.map((s) => (
              <KanbanColumn
                key={s.value}
                status={s.value}
                label={s.label}
                color={s.color}
                posts={columnPosts[s.value] || []}
              />
            ))}
          </div>
          <DragOverlay>
            {activePost ? (
              <div className="opacity-80 rotate-2">
                <PostCard post={activePost} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
