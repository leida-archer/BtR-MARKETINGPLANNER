import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { CalendarPage } from "./pages/CalendarPage";
import { KanbanPage } from "./pages/KanbanPage";
import { EventsPage } from "./pages/EventsPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { AssetsPage } from "./pages/AssetsPage";
import { PostDialog } from "./components/posts/PostDialog";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PostDialog />
    </AppShell>
  );
}
