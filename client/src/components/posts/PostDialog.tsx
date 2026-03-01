import { useEffect, useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PostForm } from "./PostForm";
import { X } from "lucide-react";
import type { PostFormData, Post } from "@/types";

export function PostDialog() {
  const open = useUIStore((s) => s.postDialogOpen);
  const selectedPostId = useUIStore((s) => s.selectedPostId);
  const closeDialog = useUIStore((s) => s.closePostDialog);
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", selectedPostId],
    queryFn: () => api.getPost(selectedPostId!),
    enabled: !!selectedPostId,
  });

  const createMutation = useMutation({
    mutationFn: (data: PostFormData) => api.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: PostFormData) => api.updatePost(selectedPostId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", selectedPostId] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deletePost(selectedPostId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      closeDialog();
    },
  });

  const handleSubmit = (data: PostFormData) => {
    if (selectedPostId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDialog} />

      {/* Dialog */}
      <div className="relative bg-charcoal border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto z-10">
        <div className="sticky top-0 z-10 bg-charcoal border-b border-border px-6 py-4 flex items-center justify-between rounded-t-xl shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {selectedPostId ? "Edit Post" : "New Post"}
          </h2>
          <button
            onClick={closeDialog}
            className="text-foreground-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {selectedPostId && isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-magenta border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <PostForm
              key={selectedPostId || "new"}
              post={selectedPostId ? (post ?? null) : null}
              onSubmit={handleSubmit}
              onDelete={selectedPostId ? () => deleteMutation.mutate() : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
