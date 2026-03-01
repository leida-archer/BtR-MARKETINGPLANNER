import { Plus, Search, X } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { FilterBar } from "@/components/filters/FilterBar";

export function TopBar() {
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const openPostDialog = useUIStore((s) => s.openPostDialog);

  return (
    <header className="sticky top-0 z-30 bg-ink/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-4 h-14 px-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search posts... (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-8 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-magenta"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <FilterBar />

        {/* New Post */}
        <button
          onClick={() => openPostDialog()}
          className="flex items-center gap-2 bg-magenta hover:bg-magenta/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>
    </header>
  );
}
