import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Kanban,
  PartyPopper,
  Image,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/calendar", icon: Calendar, label: "Calendar" },
  { to: "/kanban", icon: Kanban, label: "Pipeline" },
  { to: "/events", icon: PartyPopper, label: "Events" },
  { to: "/assets", icon: Image, label: "Assets" },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-charcoal border-r border-border flex flex-col z-40 transition-all duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-14 px-3 border-b border-border">
        <img
          src={`${import.meta.env.BASE_URL}logo-on-dark.svg`}
          alt="Beyond the Rhythm"
          className={cn(
            "transition-all duration-200",
            collapsed ? "h-8 w-8 object-contain" : "h-8"
          )}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-magenta/15 text-magenta"
                  : "text-foreground-muted hover:text-foreground hover:bg-surface-hover"
              )
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggle}
        className="flex items-center justify-center h-12 border-t border-border text-foreground-muted hover:text-foreground transition-colors"
      >
        {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
      </button>
    </aside>
  );
}
