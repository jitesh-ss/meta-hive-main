import fs from "node:fs/promises";
import path from "node:path";
import { loadManifest } from "../hive/manifest.js";
import { findHivePath } from "../utils/fileSystem.js";

export async function statusCommand(): Promise<void> {
  const hivePath = await findHivePath(process.cwd());
  if (!hivePath) {
    console.log("❌ Not in a hive. Run: /meta-hive init");
    return;
  }

  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    console.log("❌ Invalid hive structure");
    return;
  }

  // Find current profile
  let currentProfile = "";
  let isLeader = false;
  try {
    const configPath = path.join(process.cwd(), "hive-config.json");
    const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
    currentProfile = config.profileName;
    isLeader = config.isLeader;
  } catch {}

  console.log("=== Meta-Hive Status ===\n");
  console.log(`Hive: ${hivePath}`);
  console.log(`Version: ${manifest.version}`);
  console.log(`\nProjects: ${manifest.projects.length}`);
  console.log(`Profiles: ${manifest.profiles.length}`);
  console.log(`\nLeader: ${manifest.leader}`);

  if (currentProfile) {
    console.log(`\nCurrent Profile: ${currentProfile}${isLeader ? " (leader)" : ""}`);
  }

  console.log("\n--- Projects ---");
  if (manifest.projects.length === 0) {
    console.log("No projects yet. Use /new-project to create one.");
  } else {
    for (const project of manifest.projects) {
      const statusIcon = project.status === "active" ? "🟢" : project.status === "paused" ? "🟡" : "✅";
      console.log(`${statusIcon} ${project.name}: ${project.profiles.join(", ") || "no profiles"}`);
    }
  }

  console.log("\n--- Profiles ---");
  for (const profileName of manifest.profiles) {
    const isLeaderProfile = profileName === manifest.leader;
    const icon = isLeaderProfile ? "👑" : "🤖";
    const current = profileName === currentProfile ? " (you)" : "";
    console.log(`${icon} ${profileName}${current}`);
  }
}