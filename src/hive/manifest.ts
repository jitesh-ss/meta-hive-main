import fs from "node:fs/promises";
import path from "node:path";

export interface HiveManifest {
  version: string;
  leader: string;
  profiles: string[];
  projects: ProjectInfo[];
  created: string;
  lastScan: string;
}

export interface ProjectInfo {
  name: string;
  profiles: string[];
  created: string;
  status: "active" | "paused" | "completed";
}

export async function loadManifest(hivePath: string): Promise<HiveManifest | null> {
  const manifestPath = path.join(hivePath, ".hive-manifest.json");
  try {
    const content = await fs.readFile(manifestPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function saveManifest(hivePath: string, manifest: HiveManifest): Promise<void> {
  const manifestPath = path.join(hivePath, ".hive-manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}

export async function initializeManifest(hivePath: string, leaderName: string): Promise<HiveManifest> {
  const manifest: HiveManifest = {
    version: "1.0.0",
    leader: leaderName,
    profiles: [leaderName],
    projects: [],
    created: new Date().toISOString(),
    lastScan: new Date().toISOString(),
  };
  await saveManifest(hivePath, manifest);
  return manifest;
}

export async function addProfileToManifest(hivePath: string, profileName: string): Promise<void> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) return;

  if (!manifest.profiles.includes(profileName)) {
    manifest.profiles.push(profileName);
  }

  await saveManifest(hivePath, manifest);
}

export async function addProjectToManifest(
  hivePath: string,
  projectName: string,
  profiles: string[] = []
): Promise<void> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) return;

  manifest.projects.push({
    name: projectName,
    profiles,
    created: new Date().toISOString(),
    status: "active",
  });

  // Add any new profiles from this project
  for (const profileName of profiles) {
    if (!manifest.profiles.includes(profileName)) {
      manifest.profiles.push(profileName);
    }
  }

  await saveManifest(hivePath, manifest);
}

export async function assignProfileToProject(
  hivePath: string,
  projectName: string,
  profileNames: string[]
): Promise<boolean> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) return false;

  const project = manifest.projects.find(p => p.name === projectName);
  if (!project) return false;

  project.profiles.push(...profileNames.filter(p => !project.profiles.includes(p)));
  await saveManifest(hivePath, manifest);
  return true;
}