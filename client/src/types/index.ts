export interface Post {
  id: string;
  title: string;
  platform: Platform;
  postType: PostType;
  status: Status;
  priority: Priority;
  scheduledDate: string | null;
  scheduledTime: string | null;
  caption: string | null;
  notes: string | null;
  mediaUrl: string | null;
  sortOrder: number;
  eventId: string | null;
  event: { id: string; name: string } | null;
  collaboratorId: string | null;
  collaborator: { id: string; name: string } | null;
  tags: { postId: string; tagId: string; tag: Tag }[];
  assets: { postId: string; assetId: string; asset: Asset }[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  name: string;
  venue: string | null;
  date: string;
  description: string | null;
  imageUrl: string | null;
  posts: Post[] | { id: string; status: string; platform: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
  posts?: { id: string }[];
}

export interface Asset {
  id: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  alt: string | null;
  createdAt: string;
  posts?: { postId: string }[];
}

export interface Conflict {
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  posts: { id: string; title: string }[];
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface Stats {
  total: number;
  upcoming: number;
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
}

export type Platform = "instagram" | "tiktok" | "x" | "reddit";
export type PostType = "reel" | "carousel" | "story" | "static" | "text" | "comment";
export type Status = "idea" | "scripted" | "in_production" | "editing" | "approved" | "scheduled" | "posted";
export type Priority = "low" | "medium" | "high" | "urgent";

export interface PostFormData {
  title: string;
  platform: Platform;
  postType: PostType;
  status: Status;
  priority: Priority;
  scheduledDate: string;
  scheduledTime: string;
  caption: string;
  notes: string;
  mediaUrl: string;
  eventId: string;
  collaboratorId: string;
  tagIds: string[];
}
