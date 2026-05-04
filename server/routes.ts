import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import fs from "fs/promises";

const ALLOWED_DIRS = ["client/src", "shared", "server"];
const ALLOWED_EXTENSIONS = [".ts", ".tsx", ".css", ".json", ".html", ".js", ".jsx", ".svg", ".md"];

function isAllowedPath(filePath: string): boolean {
  const normalized = path.normalize(filePath).replace(/\\/g, "/");
  if (normalized.includes("..")) return false;
  return ALLOWED_DIRS.some((dir) => normalized.startsWith(dir + "/") || normalized === dir);
}

async function walkDir(dir: string, base: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(base, fullPath).replace(/\\/g, "/");
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".git") continue;
        results.push(...(await walkDir(fullPath, base)));
      } else if (ALLOWED_EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
        results.push(relPath);
      }
    }
  } catch {}
  return results;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/code/files", async (_req, res) => {
    const projectRoot = path.resolve(process.cwd());
    const allFiles: string[] = [];
    for (const dir of ALLOWED_DIRS) {
      const absDir = path.join(projectRoot, dir);
      allFiles.push(...(await walkDir(absDir, projectRoot)));
    }
    allFiles.sort();
    res.json({ files: allFiles });
  });

  app.get("/api/code/file", async (req, res) => {
    const filePath = req.query.path as string;
    if (!filePath || !isAllowedPath(filePath)) {
      return res.status(400).json({ error: "Invalid file path" });
    }
    const projectRoot = path.resolve(process.cwd());
    const absPath = path.join(projectRoot, filePath);
    try {
      const content = await fs.readFile(absPath, "utf-8");
      res.json({ path: filePath, content });
    } catch {
      res.status(404).json({ error: "File not found" });
    }
  });

  return httpServer;
}
