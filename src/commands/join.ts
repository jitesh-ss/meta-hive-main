import fs from "node:fs/promises";
import path from "node:path";
import { loadManifest, addProfileToManifest, addProjectToManifest } from "../hive/manifest.js";

interface JoinOptions {
  profile?: string;
  description?: string;
  projects?: string[];
}

export async function joinCommand(hivePath: string, options: JoinOptions): Promise<void> {
  // Resolve hive path
  const resolvedHive = path.isAbsolute(hivePath)
    ? hivePath
    : path.resolve(hivePath);

  // Check hive exists
  try {
    await fs.access(resolvedHive);
  } catch {
    console.log(`❌ Hive not found at ${resolvedHive}`);
    console.log("Run: /meta-hive init first");
    return;
  }

  const manifest = await loadManifest(resolvedHive);
  if (!manifest) {
    console.log("❌ Invalid hive structure");
    return;
  }

  // Get options
  const profileName = options.profile;
  const description = options.description || `Profile working on: ${(options.projects || []).join(", ") || "hive tasks"}`;

  if (!profileName) {
    console.log("❌ Profile name required. Use: --profile <name>");
    return;
  }

  // Check profile doesn't exist
  if (manifest.profiles.includes(profileName)) {
    console.log(`❌ Profile "${profileName}" already exists`);
    return;
  }

  console.log(`🔗 Creating profile "${profileName}"...\n`);

  // Create profile directory
  const profilePath = path.join(resolvedHive, "profiles", profileName);
  await fs.mkdir(profilePath, { recursive: true });

  // Create profile files
  await fs.writeFile(
    path.join(profilePath, "identity.md"),
    `# ${profileName}\n\n${description}`
  );

  await fs.writeFile(
    path.join(profilePath, "projects.json"),
    JSON.stringify(options.projects || [])
  );

  await fs.writeFile(
    path.join(profilePath, "system-prompt.md"),
    `You are ${profileName}, a dedicated profile in the Meta-Hive. You work on assigned projects with full focus and context.`
  );

  // Create project directories if they don't exist
  for (const projectName of (options.projects || [])) {
    const projectPath = path.join(resolvedHive, "projects", projectName);
    try {
      await fs.access(projectPath);
    } catch {
      await fs.mkdir(projectPath, { recursive: true });
      await fs.writeFile(
        path.join(projectPath, "context.md"),
        `# ${projectName}\n\nProject workspace.\n`
      );
    }

    // Add project to manifest if not exists
    if (!manifest.projects.find(p => p.name === projectName)) {
      await addProjectToManifest(resolvedHive, projectName, [profileName]);
    }
  }

  // Add profile to manifest
  await addProfileToManifest(resolvedHive, profileName);

  // Create hive-config.json in working directory
  const configPath = path.join(process.cwd(), "hive-config.json");
  const relativeHivePath = path.relative(process.cwd(), resolvedHive) || resolvedHive;
  const config = {
    profileName,
    hivePath: relativeHivePath,
    isLeader: false,
    projects: options.projects || [],
    activeProject: (options.projects && options.projects[0]) || null,
  };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Profile "${profileName}" created!\n`);
  console.log(`Hive: ${resolvedHive}`);
  console.log(`Projects: ${(options.projects || []).join(", ") || "none"}`);
  console.log(`Config: ${configPath}`);
}