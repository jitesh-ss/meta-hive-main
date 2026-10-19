import { ScanResult, Profile } from '../types/index.js';
import { getAllProfiles } from '../profile/creator.js';
import { loadManifest } from './manifest.js';
import { listDirectories } from '../utils/fileSystem.js';
import path from 'path';

const PROJECTS_DIR = 'projects';

export async function scanHive(hivePath: string): Promise<ScanResult> {
  const profiles = await getAllProfiles(hivePath);
  const projects = await scanProjects(hivePath);
  const manifest = await loadManifest(hivePath);
  const leader = manifest?.leader || 'unknown';

  const insights = await generateInsights(profiles, projects, leader, hivePath);

  return {
    profiles,
    projects,
    lastScan: new Date().toISOString(),
    insights,
  };
}

async function scanProjects(hivePath: string): Promise<string[]> {
  const projectsDir = path.join(hivePath, PROJECTS_DIR);
  return listDirectories(projectsDir);
}

async function generateInsights(
  profiles: Profile[],
  projects: string[],
  leader: string,
  _hivePath: string
): Promise<string[]> {
  const insights: string[] = [];

  insights.push(profiles.length + " profile(s) in the hive");

  if (projects.length > 0) {
    insights.push("Working on " + projects.length + " project(s): " + projects.join(", "));
  }

  const leaderProfile = profiles.find(p => p.name === leader);
  if (leaderProfile) {
    insights.push('Leader "' + leader + '" is active');
  }

  for (const profile of profiles) {
    if (profile.projects.length > 0) {
      insights.push(profile.name + " is working on: " + profile.projects.join(", "));
    }
  }

  const profilesWithMemory = profiles.filter(p => p.identity.capabilities && p.identity.capabilities.length > 0);
  if (profilesWithMemory.length > 0) {
    insights.push(profilesWithMemory.length + " profile(s) have configured capabilities");
  }

  return insights;
}

export async function getHiveSummary(hivePath: string): Promise<string> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) {
    return "No hive found. Run `meta-hive init` to create one.";
  }

  const profiles = await getAllProfiles(hivePath);
  const projects = await scanProjects(hivePath);

  const lines = [
    "=== Meta-Hive Status ===",
    "Hive: " + hivePath,
    "Version: " + manifest.version,
    "Created: " + manifest.created,
    "Leader: " + manifest.leader,
    "",
    "Profiles (" + profiles.length + "):",
    ...manifest.profiles.map(p => "  - " + p),
    "",
    "Projects (" + projects.length + "):",
    ...projects.map(p => "  - " + p),
    "",
    "Last Scan: " + new Date().toISOString(),
  ];

  return lines.join("\n");
}

export async function checkNewProfiles(hivePath: string, knownProfiles: string[]): Promise<string[]> {
  const manifest = await loadManifest(hivePath);
  if (!manifest) return [];

  return manifest.profiles.filter(p => !knownProfiles.includes(p));
}