import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Simulated Background Job for Deadlines
  // In a real production app, use a proper cron job (e.g., Cloud Scheduler)
  const checkDeadlines = async () => {
    console.log("Running deadline check...");
    // This would typically use firebase-admin to query and update
    // Since we are using client SDK in this environment mostly, 
    // we'll keep this as a placeholder for where the logic would go.
    // In a real full-stack app, I'd use firebase-admin here.
  };

  // Run every hour
  setInterval(checkDeadlines, 1000 * 60 * 60);
  // Run once on start
  checkDeadlines();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
