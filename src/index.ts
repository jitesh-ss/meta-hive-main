#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { joinCommand } from "./commands/join.js";
import { statusCommand } from "./commands/status.js";
import { profilesCommand } from "./commands/profiles.js";
import { leaveCommand } from "./commands/leave.js";
import { humanCommand } from "./commands/human.js";
import { projectCommand } from "./commands/project.js";
import { scanCommand } from "./commands/scan.js";

const program = new Command();

program
  .name("meta-hive")
  .description("Multi-agent hive orchestration system for the pi coding agent")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new hive with a leader profile")
  .option("-n, --name <name>", "Hive folder name", ".meta-hive")
  .option("-p, --profile <name>", "Leader profile name", "leader")
  .action(initCommand);

program
  .command("join <path>")
  .description("Join an existing hive")
  .option("-p, --profile <name>", "Profile name to create")
  .option("-d, --description <text>", "Profile description")
  .option("--projects <names...>", "Projects to assign")
  .action(joinCommand);

program
  .command("status")
  .description("Show hive status")
  .action(statusCommand);

program
  .command("profiles")
  .description("List all profiles in the hive")
  .action(profilesCommand);

program
  .command("leave")
  .description("Leave the current hive")
  .action(leaveCommand);

program
  .command("human")
  .description("Show human profile info")
  .action(humanCommand);

program
  .command("project")
  .description("Manage projects in the hive")
  .addCommand(
    new Command("add")
      .description("Add a new project")
      .argument("<name>", "Project name")
      .option("-p, --profiles <names...>", "Profiles to assign")
      .action(projectCommand.add)
  )
  .addCommand(
    new Command("list")
      .description("List all projects")
      .action(projectCommand.list)
  )
  .addCommand(
    new Command("assign")
      .description("Assign profiles to a project")
      .argument("<project>", "Project name")
      .argument("<profiles...>", "Profile names")
      .action(projectCommand.assign)
  );

program
  .command("scan")
  .description("Scan the hive (leader only)")
  .action(scanCommand);

program.parse();