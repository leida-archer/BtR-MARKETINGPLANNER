// IndexedDB-based binary storage for asset files
// Metadata stays in localStorage (tiny, sync); blobs live here (async, virtually unlimited)

const DB_NAME = "btr-assets";
const DB_VERSION = 1;
const STORE_NAME = "blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function putBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBlob(id: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBlob(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Active object URLs — tracked so they can be revoked on cleanup
const activeBlobUrls = new Map<string, string>();

export async function getAllBlobUrls(): Promise<Map<string, string>> {
  // Revoke any previously created URLs to prevent memory leaks
  for (const url of activeBlobUrls.values()) {
    URL.revokeObjectURL(url);
  }
  activeBlobUrls.clear();

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.openCursor();
    const urls = new Map<string, string>();

    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        const id = cursor.key as string;
        const blob = cursor.value as Blob;
        const url = URL.createObjectURL(blob);
        urls.set(id, url);
        activeBlobUrls.set(id, url);
        cursor.continue();
      } else {
        resolve(urls);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export function revokeAllBlobUrls(): void {
  for (const url of activeBlobUrls.values()) {
    URL.revokeObjectURL(url);
  }
  activeBlobUrls.clear();
}

export function revokeBlobUrl(id: string): void {
  const url = activeBlobUrls.get(id);
  if (url) {
    URL.revokeObjectURL(url);
    activeBlobUrls.delete(id);
  }
}

// Create a blob URL for a single newly-uploaded asset
export function trackBlobUrl(id: string, blob: Blob): string {
  revokeBlobUrl(id);
  const url = URL.createObjectURL(blob);
  activeBlobUrls.set(id, url);
  return url;
}

// ---------- Migration from localStorage base64 ----------

interface LegacyAssetRecord {
  id: string;
  filename: string;
  dataUrl?: string;
  mimeType: string;
  fileSize: number;
  alt: string | null;
  createdAt: string;
}

function base64ToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

export async function migrateFromLocalStorage(): Promise<void> {
  const raw = localStorage.getItem("btr_assets");
  if (!raw) return;

  let assets: LegacyAssetRecord[];
  try {
    assets = JSON.parse(raw);
  } catch {
    return;
  }

  const toMigrate = assets.filter((a) => a.dataUrl && a.dataUrl.startsWith("data:"));
  if (toMigrate.length === 0) return;

  for (const asset of toMigrate) {
    const blob = base64ToBlob(asset.dataUrl!);
    await putBlob(asset.id, blob);
    delete asset.dataUrl;
  }

  // Write cleaned metadata back to localStorage (no more base64)
  localStorage.setItem("btr_assets", JSON.stringify(assets));
}

// ---------- Initialization ----------

let initialized = false;

export async function initAssetStorage(): Promise<void> {
  if (initialized) return;
  initialized = true;
  await openDB();
  await migrateFromLocalStorage();
}
