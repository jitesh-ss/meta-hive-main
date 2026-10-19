import fs from "node:fs/promises";
import path from "node:path";
import { loadManifest } from "../hive/manifest.js";
import { findHivePath } from "../utils/fileSystem.js";

export async function profilesCommand(): Promise<void> {
  const hivePath = await findHivePath(process.cwd());
  if (!hivePath) {
    console.log("Not in a hive. Run: /meta-hive init");
    return;
  }

  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    console.log("Invalid hive structure");
    return;
  }

  let currentProfile = "";
  try {
    const configPath = path.join(process.cwd(), "hive-config.json");
    const config = JSON.parse(await fs.readFile(configPath, "utf-8"));
    currentProfile = config.profileName;
  } catch {}

  console.log("=== Hive Profiles ===\n");
  console.log("Leader: " + manifest.leader);
  console.log("Total: " + manifest.profiles.length + " profiles\n");

  for (const profileName of manifest.profiles) {
    const isLeader = profileName === manifest.leader;

    const profilePath = path.join(
      hivePath,
      isLeader ? "leader" : "profiles",
      profileName
    );
    const identityPath = path.join(profilePath, "identity.md");

    let description = "";
    try {
      const content = await fs.readFile(identityPath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("---")) {
          description = trimmed;
          break;
        }
      }
    } catch {}

    const profileProjects = manifest.projects
      .filter(p => p.profiles.includes(profileName))
      .map(p => p.name);

    const icon = isLeader ? "👑" : "🤖";
    const current = profileName === currentProfile ? " (you)" : "";

    console.log(icon + " " + profileName + current);
    console.log("   " + (description || "Profile in hive"));
    if (profileProjects.length > 0) {
      console.log("   Projects: " + profileProjects.join(", "));
    }
    console.log();
  }
}