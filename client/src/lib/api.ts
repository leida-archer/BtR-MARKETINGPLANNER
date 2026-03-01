// Client-side API layer — fetches from Vercel Serverless Functions
// All data stored in Vercel Postgres + Vercel Blob (shared across all users)

import type { Post, Event, Asset, Tag, Collaborator, Stats, HeatmapEntry, Conflict } from "@/types";

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

export const api = {
  // Posts
  getPosts: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchJSON<Post[]>(`/api/posts${qs}`);
  },
  getPost: (id: string) => fetchJSON<Post>(`/api/posts/${id}`),
  createPost: (data: any) =>
    fetchJSON<Post>("/api/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePost: (id: string, data: any) =>
    fetchJSON<Post>(`/api/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updatePostStatus: (id: string, status: string, sortOrder?: number) =>
    fetchJSON<Post>(`/api/posts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, sortOrder }),
    }),
  reschedulePost: (id: string, scheduledDate: string, scheduledTime?: string) =>
    fetchJSON<Post>(`/api/posts/${id}/schedule`, {
      method: "PATCH",
      body: JSON.stringify({ scheduledDate, scheduledTime }),
    }),
  reorderPosts: (updates: { id: string; sortOrder: number }[]) =>
    fetchJSON<{ success: boolean }>("/api/posts/reorder", {
      method: "PATCH",
      body: JSON.stringify({ updates }),
    }),
  deletePost: (id: string) =>
    fetchJSON<{ success: boolean }>(`/api/posts/${id}`, { method: "DELETE" }),

  // Events
  getEvents: () => fetchJSON<Event[]>("/api/events"),
  getEvent: (id: string) => fetchJSON<Event>(`/api/events/${id}`),
  createEvent: (data: any) =>
    fetchJSON<Event>("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEvent: (id: string, data: any) =>
    fetchJSON<Event>(`/api/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteEvent: (id: string) =>
    fetchJSON<{ success: boolean }>(`/api/events/${id}`, { method: "DELETE" }),
  generateCampaign: (id: string) =>
    fetchJSON<{ generated: number; posts: Post[] }>(`/api/events/${id}/campaign`, {
      method: "POST",
    }),

  // Tags
  getTags: () => fetchJSON<Tag[]>("/api/tags"),
  createTag: (data: any) =>
    fetchJSON<Tag>("/api/tags", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteTag: (id: string) =>
    fetchJSON<{ success: boolean }>(`/api/tags/${id}`, { method: "DELETE" }),

  // Collaborators
  getCollaborators: () => fetchJSON<Collaborator[]>("/api/collaborators"),
  createCollaborator: (data: any) =>
    fetchJSON<Collaborator>("/api/collaborators", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Assets — files stored in Vercel Blob, metadata in Vercel Postgres
  getAssets: () => fetchJSON<Asset[]>("/api/assets"),
  uploadAsset: async (file: File): Promise<Asset> => {
    const { upload } = await import("@vercel/blob/client");
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/assets/upload",
    });
    // The onUploadCompleted callback on the server creates the DB record.
    // Return a temporary asset object; the next getAssets() call will have the real one.
    return {
      id: "",
      filename: file.name,
      url: blob.url,
      mimeType: file.type,
      fileSize: file.size,
      alt: null,
      createdAt: new Date().toISOString(),
    };
  },
  deleteAsset: (id: string) =>
    fetchJSON<{ success: boolean }>(`/api/assets/${id}`, { method: "DELETE" }),

  // Download assets to user's device
  downloadAssets: async (assetIds: string[]): Promise<void> => {
    const assets = await fetchJSON<Asset[]>("/api/assets");
    for (const id of assetIds) {
      const asset = assets.find((a) => a.id === id);
      if (!asset) continue;
      const res = await fetch(asset.url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = asset.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (assetIds.length > 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  },

  // Analytics
  getStats: () => fetchJSON<Stats>("/api/analytics/stats"),
  getHeatmap: (days?: number) =>
    fetchJSON<HeatmapEntry[]>(`/api/analytics/heatmap${days ? `?days=${days}` : ""}`),
  getConflicts: () => fetchJSON<Conflict[]>("/api/analytics/conflicts"),
};
