import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image, Film, Music, X, Plus, Check, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

type MediaFilter = "all" | "image" | "video" | "audio";

function getMediaType(mimeType: string): "image" | "video" | "audio" | "other" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  return "other";
}

function AssetIcon({ mimeType, className }: { mimeType: string; className?: string }) {
  const type = getMediaType(mimeType);
  if (type === "video") return <Film className={className} />;
  if (type === "audio") return <Music className={className} />;
  return <Image className={className} />;
}

// ---------- Asset Picker Modal ----------

function AssetPickerModal({
  selectedAssetIds,
  onToggle,
  onClose,
  maxAssets,
}: {
  selectedAssetIds: string[];
  onToggle: (assetId: string) => void;
  onClose: () => void;
  maxAssets: number;
}) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: api.getAssets,
  });

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Filter assets by media type
  const filteredAssets = assets.filter((a: Asset) => {
    if (mediaFilter === "all") return true;
    return getMediaType(a.mimeType) === mediaFilter;
  });

  // Count by type for filter badges
  const counts = {
    all: assets.length,
    image: assets.filter((a: Asset) => a.mimeType.startsWith("image/")).length,
    video: assets.filter((a: Asset) => a.mimeType.startsWith("video/")).length,
    audio: assets.filter((a: Asset) => a.mimeType.startsWith("audio/")).length,
  };

  const filters: { value: MediaFilter; label: string; icon: typeof Image }[] = [
    { value: "all", label: "All", icon: LayoutGrid },
    { value: "image", label: "Photos", icon: Image },
    { value: "video", label: "Videos", icon: Film },
    { value: "audio", label: "Audio", icon: Music },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[8vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-charcoal border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[75vh] flex flex-col z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground">
              Select Assets
            </h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              {selectedAssetIds.length}/{maxAssets} selected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: filters + view toggle */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          {/* Media type filters */}
          <div className="flex items-center gap-1.5">
            {filters.map((f) => {
              const count = counts[f.value];
              if (f.value !== "all" && count === 0) return null;
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setMediaFilter(f.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    mediaFilter === f.value
                      ? "bg-magenta/15 text-magenta border border-magenta/30"
                      : "text-foreground-muted hover:text-foreground hover:bg-surface-hover border border-transparent"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {f.label}
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-ink border border-border rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "grid"
                  ? "bg-surface text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded transition-colors",
                viewMode === "list"
                  ? "bg-surface text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Asset content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-foreground-muted">
              <Image className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">
                {assets.length === 0 ? "No assets in library" : "No matching assets"}
              </p>
              <p className="text-xs mt-1">
                {assets.length === 0
                  ? "Upload assets from the Assets page first"
                  : "Try a different filter"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* Grid view */
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
              {filteredAssets.map((asset: Asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                const isDisabled = !isSelected && selectedAssetIds.length >= maxAssets;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => !isDisabled && onToggle(asset.id)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                      isSelected
                        ? "border-magenta ring-1 ring-magenta/30"
                        : isDisabled
                        ? "border-border opacity-40 cursor-not-allowed"
                        : "border-border hover:border-foreground-muted/40 cursor-pointer"
                    )}
                  >
                    {asset.mimeType.startsWith("image/") ? (
                      <img
                        src={asset.dataUrl}
                        alt={asset.alt || asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-ink flex items-center justify-center">
                        <AssetIcon mimeType={asset.mimeType} className="w-6 h-6 text-foreground-muted" />
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-magenta flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white px-1 truncate">
                      {asset.filename}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* List view */
            <div className="space-y-1">
              {filteredAssets.map((asset: Asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                const isDisabled = !isSelected && selectedAssetIds.length >= maxAssets;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => !isDisabled && onToggle(asset.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left",
                      isSelected
                        ? "bg-magenta/10 border border-magenta/30"
                        : isDisabled
                        ? "opacity-40 cursor-not-allowed border border-transparent"
                        : "hover:bg-surface-hover border border-transparent cursor-pointer"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded bg-ink border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {asset.mimeType.startsWith("image/") ? (
                        <img
                          src={asset.dataUrl}
                          alt={asset.alt || asset.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <AssetIcon mimeType={asset.mimeType} className="w-4 h-4 text-foreground-muted" />
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{asset.filename}</p>
                      <p className="text-[10px] text-foreground-muted">
                        {formatFileSize(asset.fileSize)} · {asset.mimeType.split("/")[1]?.toUpperCase()}
                      </p>
                    </div>
                    {/* Checkmark */}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-magenta flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <span className="text-xs text-foreground-muted">
            {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-magenta hover:bg-magenta/90 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Main AssetPicker ----------

export function AssetPicker({
  selectedAssetIds,
  onSelectionChange,
  maxAssets = 10,
}: {
  selectedAssetIds: string[];
  onSelectionChange: (assetIds: string[]) => void;
  maxAssets?: number;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: api.getAssets,
  });

  const toggleAsset = (assetId: string) => {
    if (selectedAssetIds.includes(assetId)) {
      onSelectionChange(selectedAssetIds.filter((id) => id !== assetId));
    } else if (selectedAssetIds.length < maxAssets) {
      onSelectionChange([...selectedAssetIds, assetId]);
    }
  };

  const removeAsset = (assetId: string) => {
    onSelectionChange(selectedAssetIds.filter((id) => id !== assetId));
  };

  // Resolve selected assets in order
  const selectedAssets = selectedAssetIds
    .map((id) => assets.find((a: Asset) => a.id === id))
    .filter(Boolean) as Asset[];

  const labelClass = "block text-xs font-medium text-foreground-muted";

  return (
    <div>
      {/* Label + counter */}
      <div className="flex items-center justify-between mb-1">
        <label className={labelClass}>Assets</label>
        <span className="text-[10px] text-foreground-muted">
          {selectedAssetIds.length}/{maxAssets}
        </span>
      </div>

      {/* Selected asset thumbnails */}
      {selectedAssets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedAssets.map((asset) => (
            <div
              key={asset.id}
              className="relative w-16 h-16 rounded-lg bg-ink border border-border overflow-hidden group"
            >
              {asset.mimeType.startsWith("image/") ? (
                <img
                  src={asset.dataUrl}
                  alt={asset.alt || asset.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <AssetIcon mimeType={asset.mimeType} className="w-5 h-5 text-foreground-muted" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAsset(asset.id)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coral/80"
              >
                <X className="w-3 h-3" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white px-1 truncate">
                {asset.filename}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add from Library button */}
      {selectedAssetIds.length < maxAssets && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted border border-dashed border-border hover:border-magenta/40 hover:text-magenta transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add from Library
        </button>
      )}

      {/* Modal — portaled to document.body to escape PostDialog overflow clipping */}
      {modalOpen &&
        createPortal(
          <AssetPickerModal
            selectedAssetIds={selectedAssetIds}
            onToggle={toggleAsset}
            onClose={() => setModalOpen(false)}
            maxAssets={maxAssets}
          />,
          document.body
        )}
    </div>
  );
}
