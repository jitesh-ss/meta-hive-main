import { readJsonFile, writeJsonFile, findHivePath } from "../utils/fileSystem.js";
import path from "path";

const CONFIG_FILE = "hive-config.json";

export interface ProfileConfig {
  profileName: string;
  hivePath: string;
  isLeader: boolean;
  projects: string[];
  activeProject: string | null;
}

export async function loadProfileConfig(cwd: string): Promise<ProfileConfig | null> {
  const configPath = path.join(cwd, CONFIG_FILE);
  try {
    return await readJsonFile(configPath) as ProfileConfig;
  } catch {
    return null;
  }
}

export async function saveProfileConfig(cwd: string, config: ProfileConfig): Promise<void> {
  const configPath = path.join(cwd, CONFIG_FILE);
  await writeJsonFile(configPath, config);
}

export async function setActiveProject(cwd: string, projectName: string): Promise<boolean> {
  const config = await loadProfileConfig(cwd);
  if (!config) return false;

  config.activeProject = projectName;
  await saveProfileConfig(cwd, config);
  return true;
}

export async function getHivePathFromConfig(cwd: string): Promise<string | null> {
  const config = await loadProfileConfig(cwd);
  if (!config?.hivePath) return null;

  const hivePath = path.isAbsolute(config.hivePath)
    ? config.hivePath
    : path.join(cwd, config.hivePath);

  return hivePath;
}

export async function getActiveProject(cwd: string): Promise<string | null> {
  const config = await loadProfileConfig(cwd);
  return config?.activeProject || null;
}