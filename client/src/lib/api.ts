// Client-side API layer — wraps localStorage DB
// Same interface as the original fetch-based API so no component changes needed

import {
  postsDB,
  eventsDB,
  tagsDB,
  collaboratorsDB,
  assetsDB,
  analyticsDB,
  generateCampaignPosts,
  type PostRecord,
  type EventRecord,
} from "./db";
import {
  putBlob,
  getBlob,
  deleteBlob,
  getAllBlobUrls,
  trackBlobUrl,
  revokeBlobUrl,
} from "./assetStorage";
import type { Post, Event, Asset } from "@/types";

// Cached blob URL map — refreshed by getAssets()
let blobUrlCache = new Map<string, string>();

function enrichPost(p: PostRecord): Post {
  const event = p.eventId ? eventsDB.getById(p.eventId) : null;
  const tags = tagsDB.getAll().filter((t) => p.tagIds.includes(t.id));
  const collaborators = collaboratorsDB.getAll();
  const collaborator = p.collaboratorId
    ? collaborators.find((c) => c.id === p.collaboratorId) || null
    : null;

  const allAssets = assetsDB.getAll();
  const resolvedAssets = (p.assetIds || [])
    .map((assetId) => {
      const meta = allAssets.find((a) => a.id === assetId);
      if (!meta) return null;
      const asset: Asset = { ...meta, dataUrl: blobUrlCache.get(assetId) || "" };
      return { postId: p.id, assetId: asset.id, asset };
    })
    .filter(Boolean);

  return {
    ...p,
    event: event ? { id: event.id, name: event.name } : null,
    collaborator: collaborator ? { id: collaborator.id, name: collaborator.name } : null,
    tags: tags.map((t) => ({ postId: p.id, tagId: t.id, tag: t })),
    assets: resolvedAssets,
  } as Post;
}

function enrichEvent(e: EventRecord): Event {
  const posts = postsDB
    .getAll()
    .filter((p) => p.eventId === e.id)
    .map((p) => ({ id: p.id, status: p.status, platform: p.platform }));
  return { ...e, posts } as Event;
}

function enrichEventFull(e: EventRecord): Event {
  const posts = postsDB
    .getAll()
    .filter((p) => p.eventId === e.id)
    .map(enrichPost);
  return { ...e, posts } as Event;
}

export const api = {
  // Posts
  getPosts: (params?: Record<string, string>) =>
    Promise.resolve(postsDB.getAll(params).map(enrichPost)),
  getPost: (id: string) => {
    const post = postsDB.getById(id);
    return Promise.resolve(post ? enrichPost(post) : null);
  },
  createPost: (data: any) => {
    const post = postsDB.create({
      ...data,
      tagIds: data.tagIds || [],
      assetIds: data.assetIds || [],
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      eventId: data.eventId || null,
      collaboratorId: data.collaboratorId || null,
    });
    return Promise.resolve(enrichPost(post));
  },
  updatePost: (id: string, data: any) => {
    const post = postsDB.update(id, {
      ...data,
      tagIds: data.tagIds || [],
      assetIds: data.assetIds || [],
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      eventId: data.eventId || null,
      collaboratorId: data.collaboratorId || null,
    });
    return Promise.resolve(post ? enrichPost(post) : null);
  },
  updatePostStatus: (id: string, status: string, sortOrder?: number) =>
    Promise.resolve(postsDB.update(id, { status, ...(sortOrder !== undefined ? { sortOrder } : {}) })),
  reschedulePost: (id: string, scheduledDate: string, scheduledTime?: string) =>
    Promise.resolve(postsDB.update(id, { scheduledDate, ...(scheduledTime !== undefined ? { scheduledTime } : {}) })),
  reorderPosts: (updates: { id: string; sortOrder: number }[]) => {
    postsDB.reorder(updates);
    return Promise.resolve({ success: true });
  },
  deletePost: (id: string) => {
    postsDB.delete(id);
    return Promise.resolve({ success: true });
  },

  // Events
  getEvents: () => Promise.resolve(eventsDB.getAll().map(enrichEvent)),
  getEvent: (id: string) => {
    const event = eventsDB.getById(id);
    return Promise.resolve(event ? enrichEventFull(event) : null);
  },
  createEvent: (data: any) => Promise.resolve(eventsDB.create(data)),
  updateEvent: (id: string, data: any) => Promise.resolve(eventsDB.update(id, data)),
  deleteEvent: (id: string) => {
    eventsDB.delete(id);
    return Promise.resolve({ success: true });
  },
  generateCampaign: (id: string) => {
    const posts = generateCampaignPosts(id);
    return Promise.resolve({ generated: posts.length, posts });
  },

  // Tags
  getTags: () => Promise.resolve(tagsDB.getAll()),
  createTag: (data: any) => Promise.resolve(tagsDB.create(data)),
  deleteTag: (id: string) => {
    tagsDB.delete(id);
    return Promise.resolve({ success: true });
  },

  // Collaborators
  getCollaborators: () => Promise.resolve(collaboratorsDB.getAll()),
  createCollaborator: (data: any) => Promise.resolve(collaboratorsDB.create(data)),

  // Assets — binary stored in IndexedDB, metadata in localStorage
  getAssets: async (): Promise<Asset[]> => {
    blobUrlCache = await getAllBlobUrls();
    const records = assetsDB.getAll();
    return records.map((r) => ({
      ...r,
      dataUrl: blobUrlCache.get(r.id) || "",
    }));
  },
  uploadAsset: async (file: File): Promise<Asset> => {
    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer], { type: file.type });
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    await putBlob(id, blob);
    const record = assetsDB.create({
      id,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
    });
    const dataUrl = trackBlobUrl(id, blob);
    blobUrlCache.set(id, dataUrl);
    return { ...record, dataUrl };
  },
  deleteAsset: async (id: string) => {
    revokeBlobUrl(id);
    blobUrlCache.delete(id);
    await deleteBlob(id);
    assetsDB.delete(id);
    return { success: true };
  },

  // Download assets to user's device
  downloadAssets: async (assetIds: string[]): Promise<void> => {
    const allMeta = assetsDB.getAll();
    for (const id of assetIds) {
      const blob = await getBlob(id);
      if (!blob) continue;
      const meta = allMeta.find((a) => a.id === id);
      const filename = meta?.filename || `asset-${id}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Small delay between downloads to avoid browser throttling
      if (assetIds.length > 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  },

  // Analytics
  getStats: () => Promise.resolve(analyticsDB.getStats()),
  getHeatmap: (days?: number) => Promise.resolve(analyticsDB.getHeatmap(days)),
  getConflicts: () => Promise.resolve(analyticsDB.getConflicts()),
};
