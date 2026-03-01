import type { Platform, Status, PostType, Priority } from "@/types";

export const PLATFORMS: { value: Platform; label: string; color: string }[] = [
  { value: "instagram", label: "Instagram", color: "#E1306C" },
  { value: "tiktok", label: "TikTok", color: "#00F2EA" },
  { value: "x", label: "X", color: "#FFFFFF" },
  { value: "reddit", label: "Reddit", color: "#FF4500" },
];

export const STATUSES: { value: Status; label: string; color: string }[] = [
  { value: "idea", label: "Idea", color: "#8B5CF6" },
  { value: "scripted", label: "Scripted", color: "#6366F1" },
  { value: "in_production", label: "In Production", color: "#F59E0B" },
  { value: "editing", label: "Editing", color: "#E8652B" },
  { value: "approved", label: "Approved", color: "#10B981" },
  { value: "scheduled", label: "Scheduled", color: "#3B82F6" },
  { value: "posted", label: "Posted", color: "#22C55E" },
];

export const POST_TYPES: { value: PostType; label: string }[] = [
  { value: "reel", label: "Reel" },
  { value: "carousel", label: "Carousel" },
  { value: "story", label: "Story" },
  { value: "static", label: "Static" },
  { value: "text", label: "Text" },
  { value: "comment", label: "Comment" },
];

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#6B5E73" },
  { value: "medium", label: "Medium", color: "#3B82F6" },
  { value: "high", label: "High", color: "#F59E0B" },
  { value: "urgent", label: "Urgent", color: "#EF4444" },
];

export function getPlatformColor(platform: string): string {
  return PLATFORMS.find((p) => p.value === platform)?.color ?? "#6B5E73";
}

export function getStatusColor(status: string): string {
  return STATUSES.find((s) => s.value === status)?.color ?? "#6B5E73";
}

export function getStatusLabel(status: string): string {
  return STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function getPlatformLabel(platform: string): string {
  return PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

export function getPriorityColor(priority: string): string {
  return PRIORITIES.find((p) => p.value === priority)?.color ?? "#6B5E73";
}
