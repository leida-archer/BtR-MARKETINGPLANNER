import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Upload, X, Image, Film, Trash2, Download } from "lucide-react";
import { format } from "date-fns";
import type { Asset } from "@/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function AssetsPage() {
  const [dragOver, setDragOver] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const queryClient = useQueryClient();

  const { data: assets = [] } = useQuery({
    queryKey: ["assets"],
    queryFn: api.getAssets,
  });

  const uploadMutation = useMutation({
    mutationFn: api.uploadAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => uploadMutation.mutate(file));
    },
    [uploadMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold mb-6">Asset Library</h1>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ${
          dragOver
            ? "border-magenta bg-magenta/5"
            : "border-border hover:border-foreground-muted"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-foreground-muted" />
        <p className="text-sm text-foreground-muted mb-2">
          Drag & drop files here, or{" "}
          <label className="text-magenta cursor-pointer hover:underline">
            browse
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        </p>
        <p className="text-xs text-foreground-muted">Images, videos, and audio — shared across all team members</p>
        {uploadMutation.isPending && (
          <p className="text-sm text-gold mt-2">Uploading...</p>
        )}
      </div>

      {/* Asset grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {assets.map((asset: Asset) => (
          <div
            key={asset.id}
            className="bg-surface border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-magenta/40 transition-colors"
            onClick={() => setPreviewAsset(asset)}
          >
            {/* Thumbnail */}
            <div className="aspect-square bg-ink flex items-center justify-center relative">
              {asset.mimeType.startsWith("image/") && asset.url ? (
                <img
                  src={asset.url}
                  alt={asset.alt || asset.filename}
                  className="w-full h-full object-cover"
                />
              ) : asset.mimeType.startsWith("video/") ? (
                <Film className="w-8 h-8 text-foreground-muted" />
              ) : (
                <Image className="w-8 h-8 text-foreground-muted" />
              )}
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={asset.url}
                  download={asset.filename}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded bg-black/60 text-white hover:bg-magenta/80 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this asset?")) {
                      deleteMutation.mutate(asset.id);
                    }
                  }}
                  className="p-1 rounded bg-black/60 text-white hover:bg-coral/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="p-2">
              <p className="text-xs text-foreground truncate">{asset.filename}</p>
              <p className="text-[10px] text-foreground-muted">
                {formatFileSize(asset.fileSize)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No assets yet</p>
          <p className="text-sm">Upload images and videos to get started</p>
        </div>
      )}

      {/* Preview modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80" onClick={() => setPreviewAsset(null)} />
          <div className="relative z-10 max-w-4xl max-h-[90vh] bg-charcoal rounded-xl overflow-hidden border border-border">
            <button
              onClick={() => setPreviewAsset(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {previewAsset.mimeType.startsWith("image/") ? (
              <img
                src={previewAsset.url}
                alt={previewAsset.alt || previewAsset.filename}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : previewAsset.mimeType.startsWith("video/") ? (
              <video
                src={previewAsset.url}
                controls
                className="max-w-full max-h-[80vh]"
              />
            ) : (
              <div className="p-12 text-foreground-muted">Preview not available</div>
            )}
            <div className="p-4 border-t border-border flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{previewAsset.filename}</p>
                <p className="text-xs text-foreground-muted">
                  {previewAsset.mimeType} &middot; {formatFileSize(previewAsset.fileSize)} &middot;{" "}
                  {format(new Date(previewAsset.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              <a
                href={previewAsset.url}
                download={previewAsset.filename}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-magenta text-white text-sm hover:bg-magenta/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
