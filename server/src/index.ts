import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { postsRouter } from "./routes/posts.js";
import { eventsRouter } from "./routes/events.js";
import { assetsRouter } from "./routes/assets.js";
import { tagsRouter } from "./routes/tags.js";
import { collaboratorsRouter } from "./routes/collaborators.js";
import { analyticsRouter } from "./routes/analytics.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

app.use("/api/posts", postsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/assets", assetsRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/collaborators", collaboratorsRouter);
app.use("/api/analytics", analyticsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`BtR Marketing Tracker API running on http://localhost:${PORT}`);
});
