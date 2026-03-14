import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./src/lib/prisma.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Sync
  app.post("/api/users/sync", async (req, res) => {
    const { uid, name, email, photoURL } = req.body;
    const SUPER_ADMIN_EMAILS = ["samxsalve1@gmail.com", "info@azariahmg.com"];
    
    try {
      const user = await prisma.user.upsert({
        where: { id: uid },
        update: { name, photoURL },
        create: { 
          id: uid, 
          name: name || email.split('@')[0], 
          email, 
          photoURL, 
          role: SUPER_ADMIN_EMAILS.includes(email) ? 'super_admin' : 'team_member' 
        },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to sync user" });
    }
  });

  app.patch("/api/users/:id/role", async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { role },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await prisma.project.findMany({
        include: { manager: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const project = await prisma.project.create({
        data: {
          ...req.body,
          deadline: new Date(req.body.deadline),
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        }
      });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await prisma.task.findMany({
        include: { project: true, assignee: true },
        orderBy: { createdAt: 'desc' }
      });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = await prisma.task.create({
        data: {
          ...req.body,
          dueDate: new Date(req.body.dueDate),
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        }
      });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to create task" });
    }
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
