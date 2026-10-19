# Meta-Hive

Multi-agent orchestration for pi. Manage projects and profiles through conversation.

## Core Concept

- **One project = one or more dedicated profiles** (no switching)
- **Leader** monitors everything, **Profiles** work on assigned projects
- **Dashboard** shows full hive status (leader only)
- **Conversational** - just describe what you want

## Commands

| Command | Who | What it does |
|---------|-----|-------------|
| `/new-project <name> [profile]` | Leader | Create project + profile together |
| `/dashboard` | Leader | See all projects + profiles |
| `/projects` | All | List projects you work on |
| `/profiles` | All | List all profiles |
| `/meta-hive status` | All | Basic status |
| `/meta-hive scan` | Leader | Refresh hive data |

## Natural Language

```
You: "Create a new project called web-app"
pi:  /new-project web-app

You: "Start working on api-service"
pi:  Creates project with profile, shows next steps

You: "Show me the dashboard"
pi:  /dashboard (leader only)

You: "What projects am I working on?"
pi:  /projects

You: "Who's in the hive?"
pi:  /profiles
```

## Workflow

```
1. /new-project web-app         # Creates project + profile
2. /dashboard                   # See everything (leader)
3. /projects                     # See your projects (profile)
4. "Create another project"      # Conversational
```

## Profile Switching

Each profile is in its own directory. To switch:
1. `cd` to that profile's directory
2. Start new pi session
3. Extension auto-detects profile from `hive-config.json`