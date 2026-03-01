const BASE_URL = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export const api = {
  // Posts
  getPosts: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>(`/posts${qs}`);
  },
  getPost: (id: string) => request<any>(`/posts/${id}`),
  createPost: (data: any) => request<any>("/posts", { method: "POST", body: JSON.stringify(data) }),
  updatePost: (id: string, data: any) => request<any>(`/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  updatePostStatus: (id: string, status: string, sortOrder?: number) =>
    request<any>(`/posts/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, sortOrder }) }),
  reschedulePost: (id: string, scheduledDate: string, scheduledTime?: string) =>
    request<any>(`/posts/${id}/schedule`, { method: "PATCH", body: JSON.stringify({ scheduledDate, scheduledTime }) }),
  reorderPosts: (updates: { id: string; sortOrder: number }[]) =>
    request<any>("/posts/reorder", { method: "PATCH", body: JSON.stringify({ updates }) }),
  deletePost: (id: string) => request<any>(`/posts/${id}`, { method: "DELETE" }),

  // Events
  getEvents: () => request<any[]>("/events"),
  getEvent: (id: string) => request<any>(`/events/${id}`),
  createEvent: (data: any) => request<any>("/events", { method: "POST", body: JSON.stringify(data) }),
  updateEvent: (id: string, data: any) => request<any>(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEvent: (id: string) => request<any>(`/events/${id}`, { method: "DELETE" }),
  generateCampaign: (id: string) => request<any>(`/events/${id}/generate-campaign`, { method: "POST" }),

  // Tags
  getTags: () => request<any[]>("/tags"),
  createTag: (data: any) => request<any>("/tags", { method: "POST", body: JSON.stringify(data) }),
  deleteTag: (id: string) => request<any>(`/tags/${id}`, { method: "DELETE" }),

  // Collaborators
  getCollaborators: () => request<any[]>("/collaborators"),
  createCollaborator: (data: any) => request<any>("/collaborators", { method: "POST", body: JSON.stringify(data) }),

  // Assets
  getAssets: () => request<any[]>("/assets"),
  uploadAsset: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/assets/upload`, { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },
  deleteAsset: (id: string) => request<any>(`/assets/${id}`, { method: "DELETE" }),

  // Analytics
  getStats: () => request<any>("/analytics/stats"),
  getHeatmap: (days?: number) => request<any[]>(`/analytics/heatmap${days ? `?days=${days}` : ""}`),
  getConflicts: () => request<any[]>("/analytics/conflicts"),
};
