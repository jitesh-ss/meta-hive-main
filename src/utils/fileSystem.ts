import fs from "node:fs/promises";
import path from "node:path";

export async function readJsonFile(filePath: string): Promise<unknown> {
  const content = await fs.readFile(filePath, "utf-8");
  return JSON.parse(content);
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function readMarkdownFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, "utf-8");
}

export async function writeMarkdownFile(filePath: string, content: string): Promise<void> {
  await fs.writeFile(filePath, content, "utf-8");
}

export async function listDirectories(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }
}

export async function findHivePath(cwd: string): Promise<string | null> {
  let checkPath = cwd;
  for (let i = 0; i < 10; i++) {
    const configPath = path.join(checkPath, "hive-config.json");
    try {
      const content = await fs.readFile(configPath, "utf-8");
      const config = JSON.parse(content);
      if (config.hivePath) {
        const resolved = path.isAbsolute(config.hivePath)
          ? config.hivePath
          : path.resolve(checkPath, config.hivePath);
        await fs.access(resolved);
        return resolved;
      }
    } catch {}

    const hivePath = path.join(checkPath, ".meta-hive");
    try {
      await fs.access(hivePath);
      return hivePath;
    } catch {}
    const parent = path.dirname(checkPath);
    if (parent === checkPath) break;
    checkPath = parent;
  }
  return null;
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}