# Meta-Hive User Guide

Everything you need to know about using Meta-Hive, right from inside pi.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Creating a New Hive](#creating-a-new-hive)
3. [Creating a New Profile](#creating-a-new-profile)
4. [Managing Projects](#managing-projects)
5. [Setting Active Project for Profile](#setting-active-project-for-profile)
6. [Viewing Hive Status](#viewing-hive-status)
7. [Understanding the Hive Structure](#understanding-the-hive-structure)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

Meta-Hive connects multiple pi agent profiles through a shared folder, creating a collective intelligence system.

```
You → Leader → Profiles → Projects
                ↓
            Human Profile (feedback, preferences)
```

**Key Concepts:**
- **Profile**: A pi agent with its own identity, memory, and skills
- **Leader**: Special profile you create - orchestrates the hive
- **Human**: Your profile for preferences and feedback
- **Projects**: Folders where profiles work

---

## Creating a New Hive

### When to Create

- First time setting up Meta-Hive
- Starting a completely new project ecosystem
- Want a separate hive for different purposes

### How to Create

Run in your terminal (or via pi's bash tool):

```bash
# Create hive in current directory
meta-hive init --name .meta-hive --profile leader

# Or create with custom name
meta-hive init --name .my-hive --profile my-leader
```

### What Happens

1. Creates `.meta-hive/` folder with:
   - `.hive-manifest.json` - Registry of all profiles
   - `leader/` - Leader profile directory
   - `profiles/` - Other profiles directory
   - `projects/` - Projects directory
   - `human/` - Your profile for preferences/feedback
   - `shared/` - Shared learnings

2. Creates leader profile with:
   - `identity.md` - Identity and personality
   - `system-prompt.md` - System instructions
   - `memory/` - agentmemory folder
   - `context/` - Working context
   - `skills/` - Custom skills
   - `extensions/` - Extensions

3. Creates `hive-config.json` in current directory (links you to the hive)

### Output Example

```
🚀 Initializing Meta-Hive...

✅ Hive created successfully!

Hive Structure:
  /path/to/.meta-hive/
    ├── .hive-manifest.json
    ├── leader/ (leader)
    ├── profiles/
    ├── projects/
    ├── human/
    └── shared/

Leader profile: leader
```

---

## Creating a New Profile

### When to Create

- Setting up pi on a new device
- Creating a specialized profile for different work
- Adding a new agent to the hive

### How to Create

From ANY directory (even a different project):

```bash
# Join existing hive with new profile
meta-hive join /path/to/existing/.meta-hive --profile my-new-profile --projects project-a project-b

# Or use npx if not installed globally
npx meta-hive join /path/to/existing/.meta-hive --profile my-new-profile --projects my-app
```

### Options

| Option | Description | Example |
|--------|-------------|---------|
| `--profile <name>` | Your profile name | `--profile laptop` |
| `--identity <text>` | Profile description | `--identity "My work profile"` |
| `--projects <names>` | Projects to work on | `--projects app1 app2` |

### What Happens

1. Creates profile folder in `.meta-hive/profiles/<profile-name>/`
2. Adds profile to `.hive-manifest.json`
3. Creates `hive-config.json` in current directory

### Multiple Devices

Each device/profile has its own `hive-config.json` in its working directory. They all point to the same `.meta-hive/` folder.

---

## Managing Projects

### Creating a New Project

```bash
# Add project to the hive
meta-hive project add my-new-project

# Or with npx
npx meta-hive project add another-project
```

### Listing Projects

```bash
meta-hive project list
```

### Project Structure

When you add a project, it creates:

```
.meta-hive/
└── projects/
    └── my-new-project/
        ├── context/
        └── memory/
```

---

## Setting Active Project for Profile

### Method 1: Using the Tool

Inside pi, the LLM can call:

```
Use meta_hive_set_project with project="my-project-name"
```

### Method 2: Edit Config File

Edit `hive-config.json` in your project directory:

```json
{
  "hivePath": "/path/to/.meta-hive",
  "profileName": "my-laptop",
  "isLeader": false,
  "activeProject": "my-project-name"
}
```

### Method 3: Run Command

```bash
# Current project folder
cd /path/to/my-project

# The extension updates config when you run join with --projects
meta-hive join /path/to/.meta-hive --profile my-profile --projects my-project
```

---

## Viewing Hive Status

### Command: status

```bash
meta-hive status
```

Shows:
- Hive path and version
- Leader info
- All profiles
- Active projects
- Hive insights

### Command: profiles

```bash
meta-hive profiles
```

Shows:
- All profiles with details
- Their identities
- Their projects

### Command: scan (Leader Only)

```bash
meta-hive scan
```

Shows:
- Hive scan results
- Profile details
- Activity insights

### Inside pi: Tools

The extension provides LLM-callable tools:

- **meta_hive_status** - Get current hive status
- **meta_hive_scan** - Scan hive for insights (leader only)
- **meta_hive_list_profiles** - List all profiles

Example usage:
```
Use meta_hive_status to check the current hive status
Use meta_hive_scan to scan all profiles and generate insights
```

### Inside pi: Context Injection

The extension automatically injects context on every turn:

**For Leader:**
```
## Meta-Hive Context
Hive: /path/to/.meta-hive
Profile: leader
Role: Leader (orchestrator)

### Hive Overview
Leader: leader
Profiles: profile1, profile2
Active Project: None
```

**For Regular Profiles:**
```
## Meta-Hive Context
Hive: /path/to/.meta-hive
Profile: laptop
Role: Profile (worker)

### Your Profile
laptop
A coding agent profile...

Working on: my-project
```

---

## Understanding the Hive Structure

```
.meta-hive/                          # Hive root (shared folder)
├── .hive-manifest.json              # Registry: profiles, leader
├── leader/                          # Leader profile
│   ├── identity.md                 # Identity & personality
│   ├── system-prompt.md             # System instructions
│   ├── memory/                      # agentmemory data
│   ├── context/                    # Current context
│   ├── skills/                     # Custom skills
│   └── extensions/                  # Extensions
├── profiles/                        # All other profiles
│   ├── laptop/
│   │   ├── identity.md
│   │   ├── system-prompt.md
│   │   ├── memory/
│   │   ├── context/
│   │   ├── skills/
│   │   ├── extensions/
│   │   └── projects.json           # Assigned projects
│   └── phone/
├── human/                           # Your profile
│   ├── profile.md                  # Preferences
│   └── feedback/                    # Feedback files
└── projects/                        # Project workspaces
    ├── project-a/
    └── project-b/
```

### Each Profile Has

| File | Purpose |
|------|---------|
| `identity.md` | Who this profile is |
| `system-prompt.md` | How it thinks/acts |
| `memory/` | agentmemory data |
| `context/` | Current working context |
| `skills/` | Profile-specific skills |
| `extensions/` | Profile-specific extensions |
| `projects.json` | List of assigned projects |

### Local Config Files

Each profile also has a `hive-config.json` in their working directory (NOT in the hive):

```json
{
  "hivePath": "/path/to/.meta-hive",
  "profileName": "laptop",
  "isLeader": false,
  "activeProject": "meta-hive"
}
```

---

## Common Tasks

### 1. Start Working on a Project

```bash
# Set active project
meta-hive set-project my-project

# Or join with project
meta-hive join /path/to/.meta-hive --profile my-profile --projects my-project
```

### 2. Check Who Else is in the Hive

```bash
meta-hive profiles
```

### 3. View Hive Overview (Leader)

```bash
meta-hive scan
```

### 4. Leave a Hive

```bash
# From the profile's working directory
meta-hive leave
```

**Note:** Leaders cannot leave (they created the hive). Delete the hive folder instead.

### 5. Edit Profile Identity

Open and edit `meta-hive/profiles/your-profile/identity.md`:

```markdown
# Your Name

Your description here.

## Personality
Your personality traits.

## Capabilities
- Capability 1
- Capability 2
```

### 6. Give Feedback to the Hive

Create a file in `meta-hive/human/feedback/`:

```markdown
# Feedback - 2024-05-24

## Things to improve
- Better error handling
- More detailed explanations

## Preferences
- Prefer TypeScript over JavaScript
- Use consistent naming conventions
```

### 7. Copy Hive to Another Device

1. Copy the entire `.meta-hive/` folder to the new device
2. Run `meta-hive join /path/to/.meta-hive --profile new-device`
3. Both devices now share the same hive

---

## Troubleshooting

### "Not connected to any hive"

**Problem:** No `hive-config.json` in current directory.

**Solution:**
```bash
# Check current directory
pwd

# Initialize or join
meta-hive init --name .meta-hive
# or
meta-hive join /path/to/existing/.meta-hive --profile my-profile
```

### "Hive manifest not found"

**Problem:** `.hive-manifest.json` missing or corrupted.

**Solution:**
```bash
# Check if hive exists
ls .meta-hive/

# Recreate if needed (WARNING: loses profile data)
rm -rf .meta-hive
meta-hive init --name .meta-hive
```

### "Only the Leader can scan"

**Problem:** You're logged in as a regular profile, not leader.

**Solution:**
- Switch to the leader profile's directory, OR
- Use `meta-hive status` instead

### Profiles Not Seeing Each Other

**Problem:** Different hive folders.

**Solution:**
- All profiles must point to the SAME `.meta-hive/` folder
- Check `hive-config.json` on each device

### Extension Not Loading

**Problem:** Extension not in right location.

**Solution:**
```bash
# Check extension location
ls ~/.pi/agent/extensions/

# Should have meta-hive folder
ls ~/.pi/agent/extensions/meta-hive/

# Reload pi
/reload
```

### Tools Not Available

**Problem:** Extension loaded but tools not registered.

**Solution:**
1. Run `/reload` in pi
2. Start a new session
3. Check for notification: "Meta-Hive: profile@role"

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `meta-hive init` | Create new hive |
| `meta-hive join <path>` | Join existing hive |
| `meta-hive status` | Show hive status |
| `meta-hive profiles` | List all profiles |
| `meta-hive project add <name>` | Add project |
| `meta-hive project list` | List projects |
| `meta-hive scan` | Scan hive (leader) |
| `meta-hive leave` | Leave hive |
| `meta-hive human` | Human profile info |

## pi Extension Commands

| Command | Description |
|---------|-------------|
| `/hive-status` | Quick status check |
| `/hive-scan` | Trigger scan (leader) |

## pi Extension Tools

| Tool | Description |
|------|-------------|
| `meta_hive_status` | Get hive status |
| `meta_hive_scan` | Scan hive (leader) |
| `meta_hive_set_project` | Set active project |
| `meta_hive_list_profiles` | List all profiles |

---

## Tips & Best Practices

1. **Use descriptive profile names:** `laptop`, `phone`, `server-work`, `personal`

2. **Keep projects organized:** Each project has its own folder in `projects/`

3. **Leader is you:** You control everything through the leader profile

4. **Obsidian integration:** Open the `.meta-hive/` folder in Obsidian to visualize your hive

5. **Feedback loop:** Use `human/feedback/` to give the hive instructions

6. **Shared learnings:** Store common skills in `shared/skills/`

7. **Back up your hive:** The `.meta-hive/` folder contains all your hive data

---

## Getting Help

- Check `/hive-status` for current connection
- Run `/hive-scan` for detailed hive info
- Review your `hive-config.json` for connection settings