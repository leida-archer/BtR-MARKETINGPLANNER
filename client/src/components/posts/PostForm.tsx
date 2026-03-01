import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PLATFORMS, STATUSES, POST_TYPES, PRIORITIES } from "@/lib/constants";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

function FormDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-foreground-muted mb-1">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border bg-ink",
          open
            ? "border-magenta/50 ring-1 ring-magenta/30"
            : "border-border hover:border-foreground-muted/30"
        )}
      >
        {selected?.color && (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: selected.color }}
          />
        )}
        <span className="text-foreground">{selected?.label || value}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 ml-auto text-foreground-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-charcoal border border-border rounded-lg shadow-xl overflow-hidden max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                value === opt.value
                  ? "bg-magenta/10 text-foreground"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {opt.color && (
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              <span>{opt.label}</span>
              {value === opt.value && (
                <span className="ml-auto text-magenta text-xs">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const queryClient = useQueryClient();
  const { data: events } = useQuery({ queryKey: ["events"], queryFn: api.getEvents });
  const { data: collaborators } = useQuery({ queryKey: ["collaborators"], queryFn: api.getCollaborators });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: api.getTags });
  const [tagInput, setTagInput] = useState("");

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

  const TAG_COLORS = ["#D6246E", "#E8652B", "#F2A922", "#8B5CF6", "#6366F1", "#10B981", "#3B82F6", "#FF6B6B", "#FFAB91", "#F59E0B"];

  const addTag = async (name: string) => {
    const trimmed = name.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed || form.tagIds.length >= 10) return;

    // Check if tag already exists
    const existing = tags?.find((t: any) => t.name.toLowerCase() === trimmed);
    if (existing) {
      if (!form.tagIds.includes(existing.id)) {
        setForm((f) => ({ ...f, tagIds: [...f.tagIds, existing.id] }));
      }
    } else {
      // Create new tag with a rotating brand color
      const colorIndex = (tags?.length || 0) % TAG_COLORS.length;
      const newTag = await api.createTag({ name: trimmed, color: TAG_COLORS[colorIndex] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setForm((f) => ({ ...f, tagIds: [...f.tagIds, newTag.id] }));
    }
    setTagInput("");
  };

  const removeTag = (tagId: string) => {
    setForm((f) => ({ ...f, tagIds: f.tagIds.filter((id) => id !== tagId) }));
  };

  const fieldClass =
    "w-full bg-ink border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-magenta";
  const labelClass = "block text-xs font-medium text-foreground-muted mb-1";

  const platformOptions: DropdownOption[] = PLATFORMS.map((p) => ({
    value: p.value,
    label: p.label,
    color: p.color,
  }));

  const postTypeOptions: DropdownOption[] = POST_TYPES.map((t) => ({
    value: t.value,
    label: t.label,
  }));

  const statusOptions: DropdownOption[] = STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
    color: s.color,
  }));

  const priorityOptions: DropdownOption[] = PRIORITIES.map((p) => ({
    value: p.value,
    label: p.label,
    color: p.color,
  }));

  const eventOptions: DropdownOption[] = [
    { value: "", label: "No event" },
    ...(events || []).map((ev: any) => ({
      value: ev.id,
      label: ev.name,
    })),
  ];

  const collaboratorOptions: DropdownOption[] = [
    { value: "", label: "Unassigned" },
    ...(collaborators || []).map((c: any) => ({
      value: c.id,
      label: c.name,
    })),
  ];

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
        <FormDropdown
          label="Platform"
          value={form.platform}
          options={platformOptions}
          onChange={(v) => set("platform", v)}
        />
        <FormDropdown
          label="Post Type"
          value={form.postType}
          options={postTypeOptions}
          onChange={(v) => set("postType", v)}
        />
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-3">
        <FormDropdown
          label="Status"
          value={form.status}
          options={statusOptions}
          onChange={(v) => set("status", v)}
        />
        <FormDropdown
          label="Priority"
          value={form.priority}
          options={priorityOptions}
          onChange={(v) => set("priority", v)}
        />
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
      <FormDropdown
        label="Event"
        value={form.eventId}
        options={eventOptions}
        onChange={(v) => set("eventId", v)}
      />

      {/* Collaborator */}
      <FormDropdown
        label="Collaborator"
        value={form.collaboratorId}
        options={collaboratorOptions}
        onChange={(v) => set("collaboratorId", v)}
      />

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelClass + " mb-0"}>Tags</label>
          <span className="text-[10px] text-foreground-muted">{form.tagIds.length}/10</span>
        </div>
        {/* Selected tags as chips */}
        {form.tagIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {form.tagIds.map((tagId) => {
              const tag = tags?.find((t: any) => t.id === tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: tag.color + "25",
                    color: tag.color,
                    border: `1px solid ${tag.color}40`,
                  }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tagId)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
        {/* Tag input */}
        {form.tagIds.length < 10 && (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
            className={fieldClass}
            placeholder="Type a tag and press Enter..."
          />
        )}
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
