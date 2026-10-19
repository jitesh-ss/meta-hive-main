# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-05-24

### Added
- Initial release
- `init` command to create a new hive with leader profile
- `join` command to join an existing hive as a new profile
- `status` command to show hive status
- `profiles` command to list all profiles
- `leave` command to leave a hive
- `human` command to show human profile info
- `project` subcommand for project management (add, list)
- `scan` command for leader to scan hive insights
- Hive manifest management
- Profile creation with identity, system-prompt, projects
- Leader scanning for hive insights
- TypeScript with strict mode
- Obsidian-compatible markdown files
- SKILL.md for pi integration

### Features
- Multi-profile orchestration through shared folder
- Leader-based coordination
- Obsidian-compatible data format
- Simple CLI interface