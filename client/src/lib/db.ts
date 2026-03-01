// LocalStorage-based database layer — replaces Express/SQLite backend
// Data persists in the browser's localStorage

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function getStore<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(`btr_${key}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(`btr_${key}`, JSON.stringify(data));
}

// ---------- POSTS ----------

export interface PostRecord {
  id: string;
  title: string;
  platform: string;
  postType: string;
  status: string;
  priority: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  caption: string | null;
  notes: string | null;
  mediaUrl: string | null;
  sortOrder: number;
  eventId: string | null;
  collaboratorId: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const postsDB = {
  getAll(filters?: Record<string, string>): PostRecord[] {
    let posts = getStore<PostRecord>("posts");
    if (filters?.status) posts = posts.filter((p) => p.status === filters.status);
    if (filters?.platform) posts = posts.filter((p) => p.platform === filters.platform);
    if (filters?.eventId) posts = posts.filter((p) => p.eventId === filters.eventId);
    if (filters?.collaboratorId) posts = posts.filter((p) => p.collaboratorId === filters.collaboratorId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.caption?.toLowerCase().includes(q)
      );
    }
    return posts.sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getById(id: string): PostRecord | undefined {
    return getStore<PostRecord>("posts").find((p) => p.id === id);
  },

  create(data: Partial<PostRecord>): PostRecord {
    const posts = getStore<PostRecord>("posts");
    const post: PostRecord = {
      id: generateId(),
      title: data.title || "",
      platform: data.platform || "instagram",
      postType: data.postType || "reel",
      status: data.status || "idea",
      priority: data.priority || "medium",
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      caption: data.caption || null,
      notes: data.notes || null,
      mediaUrl: data.mediaUrl || null,
      sortOrder: data.sortOrder ?? posts.length,
      eventId: data.eventId || null,
      collaboratorId: data.collaboratorId || null,
      tagIds: data.tagIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    posts.push(post);
    setStore("posts", posts);
    return post;
  },

  update(id: string, data: Partial<PostRecord>): PostRecord | undefined {
    const posts = getStore<PostRecord>("posts");
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    posts[idx] = { ...posts[idx], ...data, updatedAt: new Date().toISOString() };
    setStore("posts", posts);
    return posts[idx];
  },

  delete(id: string): void {
    setStore("posts", getStore<PostRecord>("posts").filter((p) => p.id !== id));
  },

  reorder(updates: { id: string; sortOrder: number }[]): void {
    const posts = getStore<PostRecord>("posts");
    for (const u of updates) {
      const p = posts.find((p) => p.id === u.id);
      if (p) p.sortOrder = u.sortOrder;
    }
    setStore("posts", posts);
  },
};

// ---------- EVENTS ----------

export interface EventRecord {
  id: string;
  name: string;
  venue: string | null;
  date: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const eventsDB = {
  getAll(): EventRecord[] {
    return getStore<EventRecord>("events").sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  getById(id: string): EventRecord | undefined {
    return getStore<EventRecord>("events").find((e) => e.id === id);
  },

  create(data: Partial<EventRecord>): EventRecord {
    const events = getStore<EventRecord>("events");
    const event: EventRecord = {
      id: generateId(),
      name: data.name || "",
      venue: data.venue || null,
      date: data.date || new Date().toISOString(),
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    events.push(event);
    setStore("events", events);
    return event;
  },

  update(id: string, data: Partial<EventRecord>): EventRecord | undefined {
    const events = getStore<EventRecord>("events");
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return undefined;
    events[idx] = { ...events[idx], ...data, updatedAt: new Date().toISOString() };
    setStore("events", events);
    return events[idx];
  },

  delete(id: string): void {
    setStore("events", getStore<EventRecord>("events").filter((e) => e.id !== id));
    // Unlink posts from this event
    const posts = getStore<PostRecord>("posts");
    for (const p of posts) {
      if (p.eventId === id) p.eventId = null;
    }
    setStore("posts", posts);
  },
};

// ---------- TAGS ----------

export interface TagRecord {
  id: string;
  name: string;
  color: string;
}

export const tagsDB = {
  getAll(): TagRecord[] {
    return getStore<TagRecord>("tags").sort((a, b) => a.name.localeCompare(b.name));
  },

  create(data: Partial<TagRecord>): TagRecord {
    const tags = getStore<TagRecord>("tags");
    const tag: TagRecord = {
      id: generateId(),
      name: data.name || "",
      color: data.color || "#D6246E",
    };
    tags.push(tag);
    setStore("tags", tags);
    return tag;
  },

  delete(id: string): void {
    setStore("tags", getStore<TagRecord>("tags").filter((t) => t.id !== id));
  },
};

// ---------- COLLABORATORS ----------

export interface CollaboratorRecord {
  id: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
}

export const collaboratorsDB = {
  getAll(): CollaboratorRecord[] {
    return getStore<CollaboratorRecord>("collaborators").sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },

  create(data: Partial<CollaboratorRecord>): CollaboratorRecord {
    const collabs = getStore<CollaboratorRecord>("collaborators");
    const collab: CollaboratorRecord = {
      id: generateId(),
      name: data.name || "",
      role: data.role || null,
      avatarUrl: data.avatarUrl || null,
    };
    collabs.push(collab);
    setStore("collaborators", collabs);
    return collab;
  },
};

// ---------- ASSETS ----------

export interface AssetRecord {
  id: string;
  filename: string;
  dataUrl: string; // Base64 data URL for localStorage
  mimeType: string;
  fileSize: number;
  alt: string | null;
  createdAt: string;
}

export const assetsDB = {
  getAll(): AssetRecord[] {
    return getStore<AssetRecord>("assets").sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  create(data: Partial<AssetRecord>): AssetRecord {
    const assets = getStore<AssetRecord>("assets");
    const asset: AssetRecord = {
      id: generateId(),
      filename: data.filename || "",
      dataUrl: data.dataUrl || "",
      mimeType: data.mimeType || "",
      fileSize: data.fileSize || 0,
      alt: data.alt || null,
      createdAt: new Date().toISOString(),
    };
    assets.push(asset);
    setStore("assets", assets);
    return asset;
  },

  delete(id: string): void {
    setStore("assets", getStore<AssetRecord>("assets").filter((a) => a.id !== id));
  },
};

// ---------- ANALYTICS ----------

export const analyticsDB = {
  getStats() {
    const posts = postsDB.getAll();
    const byStatus: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};
    let upcoming = 0;
    const now = new Date();

    for (const p of posts) {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1;
      byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
      if (p.scheduledDate && new Date(p.scheduledDate) > now && p.status !== "posted") {
        upcoming++;
      }
    }

    return { total: posts.length, upcoming, byStatus, byPlatform };
  },

  getHeatmap(days = 90) {
    const posts = postsDB.getAll();
    const from = new Date();
    from.setDate(from.getDate() - days);
    const countMap = new Map<string, number>();

    for (const p of posts) {
      if (!p.scheduledDate) continue;
      const d = new Date(p.scheduledDate);
      if (d < from) continue;
      const dateStr = d.toISOString().split("T")[0];
      countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
    }

    return Array.from(countMap, ([date, count]) => ({ date, count })).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  },

  getConflicts() {
    const posts = postsDB.getAll().filter(
      (p) => p.scheduledDate && p.scheduledTime && p.status !== "posted"
    );
    const groups = new Map<string, typeof posts>();

    for (const p of posts) {
      const key = `${p.platform}|${p.scheduledDate!.split("T")[0]}|${p.scheduledTime}`;
      const group = groups.get(key) || [];
      group.push(p);
      groups.set(key, group);
    }

    const conflicts: { platform: string; scheduledDate: string; scheduledTime: string; posts: { id: string; title: string }[] }[] = [];
    for (const [key, group] of groups) {
      if (group.length > 1) {
        const [platform, date, time] = key.split("|");
        conflicts.push({
          platform,
          scheduledDate: date,
          scheduledTime: time,
          posts: group.map((p) => ({ id: p.id, title: p.title })),
        });
      }
    }
    return conflicts;
  },
};

// ---------- CAMPAIGN GENERATOR ----------

const CAMPAIGN_TEMPLATES = [
  { offset: -30, platform: "instagram", postType: "reel", time: "19:00", priority: "high", title: "{event} — First Announcement", caption: "Something's coming to {venue}... 🔊\n\nMark your calendars. More details dropping soon.\n\n#BeyondTheRhythm #BassMusic #SanDiego" },
  { offset: -30, platform: "reddit", postType: "text", time: "12:00", priority: "medium", title: "New event in SD — {event}", caption: "Hey SD bass heads,\n\nBeyond the Rhythm is bringing something special to {venue}. Stay tuned for lineup and ticket details.\n\nWho's down?" },
  { offset: -21, platform: "instagram", postType: "carousel", time: "18:00", priority: "high", title: "{event} — Lineup Reveal", caption: "THE LINEUP IS HERE 🎵\n\nSwipe through to see who's bringing the bass to {venue}.\n\nTickets in bio.\n\n#BeyondTheRhythm #LineupReveal" },
  { offset: -14, platform: "instagram", postType: "reel", time: "19:00", priority: "medium", title: "{event} — Artist Spotlight 1", caption: "Get to know the artists bringing heat to {event} 🔥\n\n#ArtistSpotlight #BeyondTheRhythm" },
  { offset: -14, platform: "reddit", postType: "text", time: "12:00", priority: "medium", title: "{event} — Full details + ticket link", caption: "Full details for {event} at {venue}:\n\n📅 Date in bio\n🎵 Lineup revealed\n🎟️ Tickets available now" },
  { offset: -7, platform: "instagram", postType: "reel", time: "19:00", priority: "high", title: "{event} — One Week Out", caption: "One week out. The energy is building 🌊\n\n#OneWeekOut #BeyondTheRhythm" },
  { offset: -3, platform: "instagram", postType: "reel", time: "19:00", priority: "high", title: "{event} — Final Push", caption: "3 days. Limited tickets remain.\n\nDon't sleep on {event} at {venue}.\n\n#FinalPush #BeyondTheRhythm" },
  { offset: -1, platform: "instagram", postType: "reel", time: "18:00", priority: "urgent", title: "{event} — See You Tomorrow", caption: "TOMORROW NIGHT 🔊\n\n{venue}. You know the vibe.\n\n#BeyondTheRhythm" },
  { offset: 0, platform: "instagram", postType: "story", time: "21:00", priority: "urgent", title: "{event} — LIVE Coverage", caption: "WE'RE LIVE 🔴\n\n{event} happening RIGHT NOW." },
  { offset: 1, platform: "instagram", postType: "reel", time: "14:00", priority: "high", title: "{event} — Morning-After Recap", caption: "Last night was special 🙏\n\nThank you to everyone who came out.\n\n#BeyondTheRhythm #Recap" },
  { offset: 1, platform: "reddit", postType: "text", time: "12:00", priority: "medium", title: "{event} recap + photos", caption: "What a night! {event} at {venue} went OFF.\n\nPhotos coming soon. Drop your favorite moment." },
  { offset: 2, platform: "instagram", postType: "carousel", time: "18:00", priority: "medium", title: "{event} — Photo Dump", caption: "The moments that made {event} unforgettable 📸\n\n#PhotoDump #BeyondTheRhythm" },
];

export function generateCampaignPosts(eventId: string) {
  const event = eventsDB.getById(eventId);
  if (!event) return [];

  const eventDate = new Date(event.date);
  const venue = event.venue || "TBD";

  return CAMPAIGN_TEMPLATES.map((t) => {
    const schedDate = new Date(eventDate);
    schedDate.setDate(schedDate.getDate() + t.offset);

    return postsDB.create({
      title: t.title.replace(/\{event\}/g, event.name).replace(/\{venue\}/g, venue),
      platform: t.platform,
      postType: t.postType,
      status: "idea",
      priority: t.priority,
      scheduledDate: schedDate.toISOString().split("T")[0],
      scheduledTime: t.time,
      caption: t.caption.replace(/\{event\}/g, event.name).replace(/\{venue\}/g, venue),
      eventId,
    });
  });
}

// ---------- SEED DATA ----------

export function seedIfEmpty() {
  if (getStore("posts").length > 0 || getStore("events").length > 0) return;

  // Seed collaborators
  collaboratorsDB.create({ name: "Archer", role: "Founder / Content Lead" });
  collaboratorsDB.create({ name: "Guest DJ", role: "Artist Contributor" });
  collaboratorsDB.create({ name: "Photo Partner", role: "Photographer / Videographer" });

  // Seed tags
  const tagNames = [
    { name: "lineup-reveal", color: "#D6246E" },
    { name: "hype", color: "#E8652B" },
    { name: "UGC", color: "#F2A922" },
    { name: "recap", color: "#8B5CF6" },
    { name: "venue-spotlight", color: "#FF6B6B" },
    { name: "artist-spotlight", color: "#FFAB91" },
    { name: "behind-the-scenes", color: "#6366F1" },
    { name: "community", color: "#10B981" },
    { name: "ticket-push", color: "#F59E0B" },
    { name: "brand-intro", color: "#3B82F6" },
  ];
  for (const t of tagNames) tagsDB.create(t);

  // Seed events
  eventsDB.create({
    name: "BTR Launch Night",
    venue: "NOVA SD",
    date: "2026-04-18T21:00:00",
    description: "Beyond the Rhythm's inaugural event. Bass music, immersive production, community first.",
  });
  eventsDB.create({
    name: "BTR x FIT Social: Bass Communion",
    venue: "FIT Social",
    date: "2026-06-13T22:00:00",
    description: "A collaborative night of experimental bass and dubstep at SD's newest venue.",
  });
}
