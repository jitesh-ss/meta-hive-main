import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import path from "node:path";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

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

export interface ProfileConfig {
  profileName: string;
  hivePath: string;
  isLeader: boolean;
  projects: string[];
  activeProject: string | null;
}

const CONFIG_FILE = "hive-config.json";
const MANIFEST_FILE = ".hive-manifest.json";
const PROJECTS_DIR = "projects";

function runMetaHive(args: string[], cwd: string): Promise<string> {
  return new Promise((resolve) => {
    let binPath: string | null = null;
    try {
      const currentDir = path.dirname(fileURLToPath(import.meta.url));
      const candidates = [
        path.resolve(currentDir, "../index.js"),
        path.resolve(currentDir, "../../dist/index.js"),
        path.resolve(currentDir, "../../../dist/index.js"),
      ];
      for (const candidate of candidates) {
        if (fsSync.existsSync(candidate)) {
          binPath = candidate;
          break;
        }
      }
    } catch {}

    const child = binPath
      ? spawn(process.execPath, [binPath, ...args], { cwd, env: { ...process.env } })
      : spawn("meta-hive", args, { cwd, shell: true, env: { ...process.env } });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => { stdout += data.toString(); });
    child.stderr?.on("data", (data) => { stderr += data.toString(); });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout || stderr);
      } else {
        resolve(stderr || stdout || `Command exited with code ${code}`);
      }
    });
    child.on("error", () => { resolve("Command failed"); });
  });
}

async function readManifest(hivePath: string): Promise<HiveManifest | null> {
  try {
    const content = await fs.readFile(path.join(hivePath, MANIFEST_FILE), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeManifest(hivePath: string, manifest: HiveManifest): Promise<void> {
  await fs.writeFile(
    path.join(hivePath, MANIFEST_FILE),
    JSON.stringify(manifest, null, 2)
  );
}

async function getConfig(cwd: string): Promise<ProfileConfig | null> {
  try {
    const content = await fs.readFile(path.join(cwd, CONFIG_FILE), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function findHive(cwd: string): Promise<string | null> {
  let checkPath = cwd;
  for (let i = 0; i < 10; i++) {
    const hivePath = path.join(checkPath, ".meta-hive");
    try {
      await fs.access(hivePath);
      return hivePath;
    } catch {}
    const parent = path.dirname(checkPath);
    if (parent === checkPath) break;
    checkPath = parent;
  }
  return null;
}

export default async function (pi: ExtensionAPI) {
  let config: ProfileConfig | null = null;
  let hivePath: string | null = null;
  let manifest: HiveManifest | null = null;

  // Session start
  pi.on("session_start", async (_event, ctx) => {
    config = await getConfig(ctx.cwd);
    hivePath = config?.hivePath ? await findHive(ctx.cwd) : null;

    if (hivePath) {
      manifest = await readManifest(hivePath);
    }

    if (config && hivePath && manifest) {
      const role = config.isLeader ? "Leader" : "Profile";
      const projects = config.projects.length > 0
        ? "\nProjects: " + config.projects.join(", ")
        : "";

      ctx.ui.notify(
        "Hive\n------\nProfile: " + config.profileName + "\nRole: " + role + projects,
        "info"
      );
    }
  });

  // /new-project
  pi.registerCommand("new-project", {
    description: "Create project with dedicated profile",
    async handler(args, ctx) {
      if (!config?.isLeader) {
        ctx.ui.notify("Leader only.", "error");
        return;
      }

      const parts = args.trim().split(/\s+/);
      const projectName = parts[0];
      const profileName = parts[1] || projectName;

      if (!projectName) {
        ctx.ui.notify("Usage: /new-project <name> [profile]\nExample: /new-project web-app frontend", "info");
        return;
      }

      if (manifest?.projects.some(p => p.name === projectName)) {
        ctx.ui.notify("Project already exists.", "error");
        return;
      }

      ctx.ui.notify("Creating project " + projectName + "...", "info");

      // Create project
      const projectPath = path.join(hivePath!, PROJECTS_DIR, projectName);
      await fs.mkdir(projectPath, { recursive: true });
      await fs.writeFile(path.join(projectPath, "context.md"), "# " + projectName + "\n\nProject workspace.\n");
      await fs.writeFile(path.join(projectPath, "status.md"), "Status: active\nCreated: " + new Date().toISOString() + "\n");

      // Create profile
      const newProfilePath = path.join(hivePath!, "profiles", profileName);
      await fs.mkdir(newProfilePath, { recursive: true });
      await fs.writeFile(path.join(newProfilePath, "identity.md"), "# " + profileName + "\n\nDedicated profile for " + projectName + ".\n");
      await fs.writeFile(path.join(newProfilePath, "projects.json"), JSON.stringify([projectName]));

      // Update manifest
      manifest!.projects.push({
        name: projectName,
        profiles: [profileName],
        created: new Date().toISOString(),
        status: "active",
      });
      if (!manifest!.profiles.includes(profileName)) {
        manifest!.profiles.push(profileName);
      }
      await writeManifest(hivePath!, manifest!);

      ctx.ui.notify(
        "Project created!\n\nProfile " + profileName + " is dedicated to " + projectName + ".\n\nTo work:\n1. New terminal\n2. cd to project folder\n3. Start pi",
        "info"
      );
    },
  });

  // /dashboard
  pi.registerCommand("dashboard", {
    description: "View all projects (leader only)",
    async handler(_args, ctx) {
      if (!config?.isLeader) {
        ctx.ui.notify("Leader only.", "error");
        return;
      }

      if (!manifest || !hivePath) {
        ctx.ui.notify("No hive data.", "error");
        return;
      }

      let dashboard = "HIVE DASHBOARD\n----------------\n\n";
      dashboard += "Projects: " + manifest.projects.length + "\n";
      dashboard += "Profiles: " + manifest.profiles.length + "\n\n";

      for (const project of manifest.projects) {
        const statusIcon = project.status === "active" ? "[active]" : project.status === "paused" ? "[paused]" : "[done]";
        dashboard += statusIcon + " " + project.name + "\n";
        dashboard += "   Profiles: " + (project.profiles.join(", ") || "none") + "\n\n";
      }

      const assignedProfiles = manifest.projects.flatMap(p => p.profiles);
      const unassigned = manifest.profiles.filter(p => !assignedProfiles.includes(p) && p !== manifest!.leader);
      if (unassigned.length > 0) {
        dashboard += "Unassigned: " + unassigned.join(", ") + "\n";
      }

      ctx.ui.notify(dashboard, "info");
    },
  });

  // /projects
  pi.registerCommand("projects", {
    description: "List projects",
    async handler(_args, ctx) {
      if (!manifest || !hivePath) {
        ctx.ui.notify("No hive.", "error");
        return;
      }

      if (manifest.projects.length === 0) {
        ctx.ui.notify("No projects. Use /new-project <name>", "info");
        return;
      }

      if (config?.isLeader) {
        let list = "ALL PROJECTS\n-------------\n\n";
        for (const project of manifest.projects) {
          const statusIcon = project.status === "active" ? "[active]" : project.status === "paused" ? "[paused]" : "[done]";
          list += statusIcon + " " + project.name + "\n";
          list += "   Profiles: " + (project.profiles.join(", ") || "none") + "\n\n";
        }
        ctx.ui.notify(list, "info");
      } else if (config) {
        const myConfig = config;
        const myProjects = manifest.projects.filter(p => myConfig.projects.includes(p.name));
        let list = "YOUR PROJECTS\n--------------\n\n";
        for (const project of myProjects) {
          list += "[active] " + project.name + "\n\n";
        }
        ctx.ui.notify(list, "info");
      }
    },
  });

  // /profiles
  pi.registerCommand("profiles", {
    description: "List profiles",
    async handler(_args, ctx) {
      if (!manifest || !hivePath) {
        ctx.ui.notify("No hive.", "error");
        return;
      }

      let list = "PROFILES\n---------\n\n";
      for (const profileName of manifest.profiles) {
        const isLeader = profileName === manifest.leader;
        const icon = isLeader ? "[leader]" : "[profile]";
        const current = profileName === config?.profileName ? " (you)" : "";
        list += icon + " " + profileName + current + "\n";
      }

      ctx.ui.notify(list, "info");
    },
  });

  // /hive
  pi.registerCommand("hive", {
    description: "Quick status",
    handler: async (_args, ctx) => {
      if (!manifest || !config) {
        ctx.ui.notify("Not connected.", "error");
        return;
      }
      ctx.ui.notify(
        config.profileName + "@" + (config.isLeader ? "leader" : "profile") + " | " + manifest.projects.length + " projects | " + manifest.profiles.length + " profiles",
        "info"
      );
    },
  });

  // /meta-hive
  pi.registerCommand("meta-hive", {
    description: "Meta-hive commands",
    async handler(args, ctx) {
      const cmd = args.trim().split(/\s+/)[0];

      if (!cmd) {
        ctx.ui.notify("Commands:\n/new-project <name> [profile]\n/dashboard\n/projects\n/profiles\n/hive", "info");
        return;
      }

      if (cmd === "status") {
        await runMetaHive(["status"], ctx.cwd).then(output => ctx.ui.notify(output.substring(0, 300), "info"));
      } else if (cmd === "scan") {
        await runMetaHive(["scan"], ctx.cwd).then(output => ctx.ui.notify(output.substring(0, 200), "info"));
      } else {
        ctx.ui.notify("Unknown: " + cmd + ". Use /hive for commands.", "info");
      }
    },
  });

  // Tools
  pi.registerTool({
    name: "meta_hive_status",
    label: "Hive Status",
    description: "Get hive status",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (!manifest || !hivePath || !config) {
        return { content: [{ type: "text" as const, text: "Not connected. Run /meta-hive init first." }], details: {} };
      }

      const status = "Hive Status\n\nProjects: " + manifest.projects.length + "\nProfiles: " + manifest.profiles.length + "\nYour Profile: " + config.profileName + "\nYour Projects: " + (config.projects.join(", ") || "none");

      return { content: [{ type: "text" as const, text: status }], details: { manifest, config } };
    },
  });

  pi.registerTool({
    name: "meta_hive_dashboard",
    label: "Hive Dashboard",
    description: "Get dashboard (leader only)",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (!config?.isLeader || !manifest) {
        return { content: [{ type: "text" as const, text: "Leader access required." }], details: {} };
      }

      let dashboard = "# Hive Dashboard\n\n";
      dashboard += "Projects: " + manifest.projects.length + "\n";
      dashboard += "Profiles: " + manifest.profiles.length + "\n\n";

      for (const project of manifest.projects) {
        const status = project.status === "active" ? "[active]" : project.status === "paused" ? "[paused]" : "[done]";
        dashboard += status + " " + project.name + "\n";
        dashboard += "Profiles: " + (project.profiles.join(", ") || "none") + "\n\n";
      }

      return { content: [{ type: "text" as const, text: dashboard }], details: { manifest } };
    },
  });

  pi.registerTool({
    name: "meta_hive_my_projects",
    label: "My Projects",
    description: "Get your assigned projects",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, _ctx) {
      if (!config || !manifest) {
        return { content: [{ type: "text" as const, text: "Not connected." }], details: {} };
      }

      const myProjects = config.isLeader
        ? manifest.projects
        : manifest.projects.filter(p => p.profiles.includes(config!.profileName));

      let output = "# " + (config.isLeader ? "All" : "My") + " Projects\n\n";
      for (const project of myProjects) {
        output += "- " + project.name + " (" + project.status + ")\n";
      }

      return { content: [{ type: "text" as const, text: output }], details: { projects: myProjects } };
    },
  });
}