import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import postsRouter from "./routes/posts";
import usersRouter from "./routes/users";
import followsRouter from "./routes/follows";
import likesRouter from "./routes/likes";
import commentsRouter from "./routes/comments";
import messagesRouter from "./routes/messages";
import notificationsRouter from "./routes/notifications";
import discoverRouter from "./routes/discover";
import searchRouter from "./routes/search";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Better Auth routes - MUST be before express.json()
app.all("/api/auth/*", toNodeHandler(auth));

// JSON middleware - MUST be after Better Auth handler
app.use(express.json());

// API routes
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter);
app.use("/api/follows", followsRouter);
app.use("/api/likes", likesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/discover", discoverRouter);
app.use("/api/search", searchRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
