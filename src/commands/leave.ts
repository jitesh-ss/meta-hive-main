import fs from "node:fs/promises";
import path from "node:path";
import { findHivePath } from "../utils/fileSystem.js";

export async function leaveCommand(): Promise<void> {
  const configPath = path.join(process.cwd(), "hive-config.json");

  try {
    await fs.unlink(configPath);
    console.log("✅ Left the hive!");
    console.log("Note: Your profile data still exists in the hive.");
    console.log("To rejoin, use: meta-hive join <hive-path> --profile <name>");
  } catch {
    console.log("❌ Not connected to any hive.");
  }
}