import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./src/lib/prisma";

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
    const { uid, name, email } = req.body;
    const normalizedEmail = email?.toLowerCase();
    
    const HARDCODED_USERS = [
      { email: 'info@azariahmg.com', role: 'super_admin' },
      { email: 'chiffon@azariahmg.com', role: 'team_member' },
      { email: 'dele@azariahmg.com', role: 'team_member' },
      { email: 'joseph@azariahmg.com', role: 'team_member' },
    ];
    
    try {
      if (!normalizedEmail) {
        return res.status(400).json({ error: "Email is required" });
      }

      const hardcodedUser = HARDCODED_USERS.find(u => u.email === normalizedEmail);
      
      if (!hardcodedUser) {
        return res.status(403).json({ error: "Access denied. Your account has not been authorized." });
      }

      // Check by email first to avoid unique constraint violations
      let user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { email: normalizedEmail },
          data: { 
            name: name || user.name,
            // If the ID in DB is different from what client sent, we stick with DB ID
            // but in our case they should be the same.
          },
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            id: uid,
            name: name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            role: hardcodedUser.role as any
          }
        });
      }
      
      const userResponse = {
        ...user,
        uid: user.id
      };
      
      res.json(userResponse);
    } catch (error) {
      console.error("Sync error:", error);
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

  app.post("/api/users", async (req, res) => {
    const { name, email, role } = req.body;
    try {
      const normalizedEmail = email.toLowerCase();
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }

      const user = await prisma.user.create({
        data: {
          id: `manual_${Date.now()}`, // Generate a temporary ID for manual users
          name,
          email: normalizedEmail,
          role
        }
      });
      res.json(user);
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ error: "Failed to create user" });
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
      const { managerId, ...rest } = req.body;
      const project = await prisma.project.create({
        data: {
          ...rest,
          managerId,
          deadline: new Date(req.body.deadline),
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: managerId,
          action: `Created project: ${project.name}`,
          entityType: 'project',
          entityId: project.id,
        }
      });

      res.json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const project = await prisma.project.update({
        where: { id },
        data: {
          ...req.body,
          deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        }
      });
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const { id } = req.params;
    try {
      // Delete associated tasks first
      await prisma.task.deleteMany({ where: { projectId: id } });
      await prisma.project.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
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
      const { assignedTo, ...rest } = req.body;
      const task = await prisma.task.create({
        data: {
          ...rest,
          assignedTo,
          dueDate: new Date(req.body.dueDate),
          startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        }
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: assignedTo, // Or the creator, but assignedTo is a good start
          action: `Assigned task: ${task.title}`,
          entityType: 'task',
          entityId: task.id,
        }
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: assignedTo,
          message: `You have been assigned a new task: ${task.title}`,
          type: 'task_assignment',
          relatedEntityId: task.id
        }
      });

      res.json(task);
    } catch (error) {
      console.error("Task creation error:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const task = await prisma.task.update({
        where: { id },
        data: {
          ...req.body,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
          startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        }
      });
      res.json(task);
    } catch (error) {
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.task.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await prisma.activityLog.findMany({
        include: { user: true },
        orderBy: { timestamp: 'desc' },
        take: 20
      });
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    const { userId } = req.query;
    try {
      const notifications = await prisma.notification.findMany({
        where: (userId && userId !== 'undefined') ? { userId: String(userId) } : {},
        orderBy: { createdAt: 'desc' }
      });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    const { id } = req.params;
    try {
      const notification = await prisma.notification.update({
        where: { id },
        data: { read: true }
      });
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to update notification" });
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
