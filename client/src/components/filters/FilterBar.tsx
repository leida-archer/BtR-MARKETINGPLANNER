import { useState, useRef, useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PLATFORMS, STATUSES } from "@/lib/constants";
import { X, ChevronDown, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  value: string;
  label: string;
  color?: string;
}

function FilterDropdown({
  label,
  value,
  options,
  onChange,
  icon,
}: {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string | null) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border",
          value
            ? "bg-magenta/10 border-magenta/30 text-magenta"
            : "bg-surface border-border text-foreground-muted hover:text-foreground hover:border-foreground-muted/30"
        )}
      >
        {selected?.color && (
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: selected.color }}
          />
        )}
        {!selected?.color && icon}
        <span>{selected?.label || label}</span>
        <ChevronDown
          className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 min-w-[180px] bg-charcoal border border-border rounded-lg shadow-xl overflow-hidden">
          {/* All option */}
          <button
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors",
              !value
                ? "bg-magenta/10 text-magenta"
                : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {label}
          </button>

          <div className="h-px bg-border" />

          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors",
                value === opt.value
                  ? "bg-magenta/10 text-foreground"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {opt.color && (
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              <span>{opt.label}</span>
              {value === opt.value && (
                <span className="ml-auto text-magenta text-xs">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterBar() {
  const filters = useUIStore((s) => s.filters);
  const setFilter = useUIStore((s) => s.setFilter);
  const clearFilters = useUIStore((s) => s.clearFilters);

  const { data: events } = useQuery({ queryKey: ["events"], queryFn: api.getEvents });

  const hasFilters = Object.values(filters).some(Boolean);

  const platformOptions: DropdownOption[] = PLATFORMS.map((p) => ({
    value: p.value,
    label: p.label,
    color: p.color,
  }));

  const statusOptions: DropdownOption[] = STATUSES.map((s) => ({
    value: s.value,
    label: s.label,
    color: s.color,
  }));

  const eventOptions: DropdownOption[] = (events || []).map((ev: any) => ({
    value: ev.id,
    label: ev.name,
  }));

  return (
    <div className="flex items-center gap-2">
      <FilterDropdown
        label="All Platforms"
        value={filters.platform}
        options={platformOptions}
        onChange={(v) => setFilter("platform", v)}
      />

      <FilterDropdown
        label="All Statuses"
        value={filters.status}
        options={statusOptions}
        onChange={(v) => setFilter("status", v)}
      />

      <FilterDropdown
        label="All Events"
        value={filters.eventId}
        options={eventOptions}
        onChange={(v) => setFilter("eventId", v)}
        icon={<PartyPopper className="w-3.5 h-3.5" />}
      />

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-magenta hover:bg-magenta/10 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
