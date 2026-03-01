import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image, Film, X, Plus, Check } from "lucide-react";
import type { Asset } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function AssetPicker({
  selectedAssetIds,
  onSelectionChange,
  maxAssets = 10,
}: {
  selectedAssetIds: string[];
  onSelectionChange: (assetIds: string[]) => void;
  maxAssets?: number;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: api.getAssets,
  });

  // Close picker on click outside or Escape
  useEffect(() => {
    if (!pickerOpen) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setPickerOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [pickerOpen]);

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
    <div ref={pickerRef}>
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
                  <Film className="w-5 h-5 text-foreground-muted" />
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
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-foreground-muted border border-dashed border-border hover:border-magenta/40 hover:text-magenta transition-colors"
        >
          {pickerOpen ? (
            <X className="w-3.5 h-3.5" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
          {pickerOpen ? "Close" : "Add from Library"}
        </button>
      )}

      {/* Library picker panel */}
      {pickerOpen && (
        <div className="mt-2 bg-charcoal border border-border rounded-lg p-3 max-h-[240px] overflow-y-auto">
          {assets.length === 0 ? (
            <div className="text-center py-6 text-foreground-muted">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No assets in library</p>
              <p className="text-[10px] mt-1">Upload assets from the Assets page first</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {assets.map((asset: Asset) => {
                const isSelected = selectedAssetIds.includes(asset.id);
                const isDisabled = !isSelected && selectedAssetIds.length >= maxAssets;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => !isDisabled && toggleAsset(asset.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-magenta ring-1 ring-magenta/30"
                        : isDisabled
                        ? "border-border opacity-40 cursor-not-allowed"
                        : "border-border hover:border-foreground-muted/40 cursor-pointer"
                    }`}
                  >
                    {asset.mimeType.startsWith("image/") ? (
                      <img
                        src={asset.dataUrl}
                        alt={asset.alt || asset.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-ink flex items-center justify-center">
                        <Film className="w-5 h-5 text-foreground-muted" />
                      </div>
                    )}
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-magenta flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Filename tooltip */}
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white px-1 truncate">
                      {asset.filename}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
