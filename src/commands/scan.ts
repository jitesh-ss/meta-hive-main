import fs from "node:fs/promises";
import path from "node:path";
import { loadManifest, saveManifest } from "../hive/manifest.js";
import { findHivePath } from "../utils/fileSystem.js";

export async function scanCommand(): Promise<void> {
  const hivePath = await findHivePath(process.cwd());
  if (!hivePath) {
    console.log("❌ Not in a hive.");
    return;
  }

  // Check if leader
  let isLeader = false;
  try {
    const configPath = path.join(process.cwd(), "hive-config.json");
    const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
    isLeader = config.isLeader;
  } catch {}

  if (!isLeader) {
    console.log("❌ Only the Leader can scan.");
    return;
  }

  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    console.log("❌ Invalid hive structure");
    return;
  }

  console.log("=== Hive Scan ===\n");
  console.log(`Projects: ${manifest.projects.length}`);
  console.log(`Profiles: ${manifest.profiles.length}`);
  console.log(`\n--- Projects ---\n`);

  for (const project of manifest.projects) {
    const statusIcon = project.status === "active" ? "🟢" : project.status === "paused" ? "🟡" : "✅";
    console.log(`${statusIcon} ${project.name}`);
    console.log(`   Profiles: ${project.profiles.join(", ") || "none"}\n`);
  }

  console.log("--- Insights ---\n");
  const activeProjects = manifest.projects.filter(p => p.status === "active").length;
  console.log(`💡 ${activeProjects} active project(s)`);
  console.log(`💡 ${manifest.profiles.length} profile(s) in hive`);

  // Update last scan
  manifest.lastScan = new Date().toISOString();
  await saveManifest(hivePath, manifest);

  console.log(`\nLast scan: ${new Date().toLocaleString()}`);
}