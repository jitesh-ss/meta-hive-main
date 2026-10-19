import fs from "node:fs/promises";
import path from "node:path";
import { findHivePath } from "../utils/fileSystem.js";

export async function humanCommand(): Promise<void> {
  const hivePath = await findHivePath(process.cwd());
  if (!hivePath) {
    console.log("❌ Not in a hive.");
    return;
  }

  const humanPath = path.join(hivePath, "human", "profile.md");
  try {
    const content = await fs.readFile(humanPath, "utf-8");
    console.log("=== Human Profile ===\n");
    console.log(content);
  } catch {
    console.log("Human profile not found.");
  }
}