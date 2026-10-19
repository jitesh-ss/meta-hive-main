import fs from "node:fs/promises";
import path from "node:path";
import { loadManifest } from "../hive/manifest.js";
import { findHivePath } from "../utils/fileSystem.js";

interface ProjectSubCommand {
  add: (name: string, options?: { profiles?: string[] }) => Promise<void>;
  list: () => Promise<void>;
  assign: (project: string, profiles: string[]) => Promise<void>;
}

export const projectCommand: ProjectSubCommand = {
  async add(name: string, options?: { profiles?: string[] }) {
    const hivePath = await findHivePath(process.cwd());
    if (!hivePath) {
      console.log("❌ Not in a hive.");
      return;
    }

    const manifest = await loadManifest(hivePath);
    if (!manifest) {
      console.log("❌ Invalid hive structure");
      return;
    }

    // Check if project exists
    if (manifest.projects.find(p => p.name === name)) {
      console.log(`❌ Project "${name}" already exists`);
      return;
    }

    // Create project directory
    const projectPath = path.join(hivePath, "projects", name);
    await fs.mkdir(projectPath, { recursive: true });

    await fs.writeFile(
      path.join(projectPath, "context.md"),
      `# ${name}\n\nProject workspace.\n`
    );

    // Add to manifest
    manifest.projects.push({
      name,
      profiles: options?.profiles || [],
      created: new Date().toISOString(),
      status: "active",
    });

    for (const profileName of (options?.profiles || [])) {
      if (!manifest.profiles.includes(profileName)) {
        manifest.profiles.push(profileName);
      }
    }

    await fs.writeFile(
      path.join(hivePath, ".hive-manifest.json"),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`✅ Project "${name}" created!`);
    if (options?.profiles?.length) {
      console.log(`   Assigned: ${options.profiles.join(", ")}`);
    }
  },

  async list() {
    const hivePath = await findHivePath(process.cwd());
    if (!hivePath) {
      console.log("❌ Not in a hive.");
      return;
    }

    const manifest = await loadManifest(hivePath);
    if (!manifest || manifest.projects.length === 0) {
      console.log("No projects yet.");
      return;
    }

    console.log("=== Projects ===\n");
    for (const project of manifest.projects) {
      const statusIcon = project.status === "active" ? "🟢" : project.status === "paused" ? "🟡" : "✅";
      console.log(`${statusIcon} ${project.name}`);
      console.log(`   Profiles: ${project.profiles.join(", ") || "none"}\n`);
    }
  },

  async assign(projectName: string, profileNames: string[]) {
    const hivePath = await findHivePath(process.cwd());
    if (!hivePath) {
      console.log("❌ Not in a hive.");
      return;
    }

    const manifest = await loadManifest(hivePath);
    if (!manifest) {
      console.log("❌ Invalid hive structure");
      return;
    }

    const project = manifest.projects.find(p => p.name === projectName);
    if (!project) {
      console.log(`❌ Project "${projectName}" not found`);
      return;
    }

    for (const profileName of profileNames) {
      if (!project.profiles.includes(profileName)) {
        project.profiles.push(profileName);
      }
      if (!manifest.profiles.includes(profileName)) {
        manifest.profiles.push(profileName);
      }
    }

    await fs.writeFile(
      path.join(hivePath, ".hive-manifest.json"),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`✅ Assigned ${profileNames.join(", ")} to "${projectName}"`);
  },
};