import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PLATFORMS, STATUSES, POST_TYPES, PRIORITIES } from "@/lib/constants";
import type { Post, PostFormData } from "@/types";

const EMPTY_FORM: PostFormData = {
  title: "",
  platform: "instagram",
  postType: "reel",
  status: "idea",
  priority: "medium",
  scheduledDate: "",
  scheduledTime: "",
  caption: "",
  notes: "",
  mediaUrl: "",
  eventId: "",
  collaboratorId: "",
  tagIds: [],
};

export function PostForm({
  post,
  onSubmit,
  onDelete,
}: {
  post?: Post | null;
  onSubmit: (data: PostFormData) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<PostFormData>(EMPTY_FORM);

  const { data: events } = useQuery({ queryKey: ["events"], queryFn: api.getEvents });
  const { data: collaborators } = useQuery({ queryKey: ["collaborators"], queryFn: api.getCollaborators });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: api.getTags });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        platform: post.platform,
        postType: post.postType,
        status: post.status,
        priority: post.priority,
        scheduledDate: post.scheduledDate ? post.scheduledDate.split("T")[0] : "",
        scheduledTime: post.scheduledTime || "",
        caption: post.caption || "",
        notes: post.notes || "",
        mediaUrl: post.mediaUrl || "",
        eventId: post.eventId || "",
        collaboratorId: post.collaboratorId || "",
        tagIds: post.tags?.map((t) => t.tagId) || [],
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [post]);

  const set = (key: keyof PostFormData, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleTag = (tagId: string) => {
    setForm((f) => ({
      ...f,
      tagIds: f.tagIds.includes(tagId)
        ? f.tagIds.filter((id) => id !== tagId)
        : [...f.tagIds, tagId],
    }));
  };

  const fieldClass =
    "w-full bg-ink border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-magenta";
  const labelClass = "block text-xs font-medium text-foreground-muted mb-1";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-4"
    >
      {/* Title */}
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={fieldClass}
          placeholder="Post title..."
          required
        />
      </div>

      {/* Platform + Type row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Platform</label>
          <select value={form.platform} onChange={(e) => set("platform", e.target.value)} className={fieldClass}>
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Post Type</label>
          <select value={form.postType} onChange={(e) => set("postType", e.target.value)} className={fieldClass}>
            {POST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value)} className={fieldClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={fieldClass}>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Scheduled Date</label>
          <input
            type="date"
            value={form.scheduledDate}
            onChange={(e) => set("scheduledDate", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Scheduled Time</label>
          <input
            type="time"
            value={form.scheduledTime}
            onChange={(e) => set("scheduledTime", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {/* Event */}
      <div>
        <label className={labelClass}>Event</label>
        <select value={form.eventId} onChange={(e) => set("eventId", e.target.value)} className={fieldClass}>
          <option value="">No event</option>
          {events?.map((ev: any) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      {/* Collaborator */}
      <div>
        <label className={labelClass}>Collaborator</label>
        <select value={form.collaboratorId} onChange={(e) => set("collaboratorId", e.target.value)} className={fieldClass}>
          <option value="">Unassigned</option>
          {collaborators?.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags?.map((tag: any) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="px-2 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                backgroundColor: form.tagIds.includes(tag.id)
                  ? tag.color + "30"
                  : "transparent",
                color: form.tagIds.includes(tag.id) ? tag.color : "var(--color-foreground-muted)",
                border: `1px solid ${form.tagIds.includes(tag.id) ? tag.color : "var(--color-border)"}`,
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Caption */}
      <div>
        <label className={labelClass}>Caption</label>
        <textarea
          value={form.caption}
          onChange={(e) => set("caption", e.target.value)}
          className={fieldClass + " min-h-[100px] resize-y"}
          placeholder="Post caption..."
        />
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Internal Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={fieldClass + " min-h-[60px] resize-y"}
          placeholder="Notes for collaborators..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-magenta hover:bg-magenta/90 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {post ? "Update Post" : "Create Post"}
        </button>
        {post && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2.5 rounded-lg text-sm font-medium text-coral hover:bg-coral/10 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
