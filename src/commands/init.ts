import fs from "node:fs/promises";
import path from "node:path";
import { loadManifest, initializeManifest } from "../hive/manifest.js";

interface InitOptions {
  name: string;
  profile: string;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const hivePath = path.resolve(options.name);
  const profileName = options.profile;

  console.log("🚀 Initializing Meta-Hive...\n");

  // Check if hive already exists
  try {
    await fs.access(hivePath);
    console.log(`❌ Hive already exists at ${hivePath}`);
    return;
  } catch {}

  // Create hive structure
  await fs.mkdir(path.join(hivePath, "leader", profileName), { recursive: true });
  await fs.mkdir(path.join(hivePath, "profiles"), { recursive: true });
  await fs.mkdir(path.join(hivePath, "projects"), { recursive: true });
  await fs.mkdir(path.join(hivePath, "human"), { recursive: true });
  await fs.mkdir(path.join(hivePath, "shared"), { recursive: true });

  // Initialize manifest
  await initializeManifest(hivePath, profileName);

  // Create leader profile
  await fs.writeFile(
    path.join(hivePath, "leader", profileName, "identity.md"),
    `# ${profileName}\n\nLeader of the Meta-Hive. Orchestrates all profiles and provides insights.`
  );
  await fs.writeFile(
    path.join(hivePath, "leader", profileName, "projects.json"),
    JSON.stringify([])
  );
  await fs.writeFile(
    path.join(hivePath, "leader", profileName, "system-prompt.md"),
    "You are the Hive Leader. You monitor all projects and profiles, coordinate work, and provide the human with insights about the hive's activities."
  );

  // Create human profile
  await fs.writeFile(
    path.join(hivePath, "human", "profile.md"),
    `# Human Profile\n\nThe human user of this hive. Owner of all projects and profiles.`
  );

  // Create shared memory
  await fs.writeFile(
    path.join(hivePath, "shared", "memory.md"),
    "# Hive Memory\n\nShared knowledge across all profiles.\n"
  );

  // Create hive-config.json in working directory
  const configPath = path.join(process.cwd(), "hive-config.json");
  try {
    await fs.access(configPath);
  } catch {
    const relativeHivePath = path.relative(process.cwd(), hivePath) || options.name;
    const config = {
      profileName,
      hivePath: relativeHivePath,
      isLeader: true,
      projects: [],
      activeProject: null,
    };
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  }

  console.log("✅ Hive created successfully!\n");
  console.log(`Hive: ${hivePath}`);
  console.log(`Leader: ${profileName}`);
  console.log("\nNext steps:");
  console.log("1. /new-project <name> - Create a project with dedicated profile");
  console.log("2. /dashboard - View all projects and profiles");
  console.log("3. /projects - List all projects");
}