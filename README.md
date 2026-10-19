# 🐝 meta-hive

> **Setup prompt - copy and paste into your agent:**
>
> ```
> Install and setup meta-hive for pi coding agent:
>
> 1. git clone https://github.com/jitesh-ss/meta-hive ~/meta-hive
>
> 2. cd ~/meta-hive && npm install && npm link && npm run build
>
> 3. mkdir -p ~/.pi/agent/extensions && cp -r ~/meta-hive/src/extension ~/.pi/agent/extensions/meta-hive
>
> 4. mkdir ~/hive && cd ~/hive && meta-hive init --name .meta-hive --profile leader
>
> 5. cd ~/hive && cat > hive-config.json << 'EOF'
> {"profileName":"leader","hivePath":".meta-hive","isLeader":true,"projects":[],"activeProject":null}
> EOF
>
> 6. Reload pi: /reload
>
> Done! Run /dashboard or /new-project web-app in pi.
> ```

---

Multi-agent orchestration for [pi](https://github.com/earendil-works/pi-coding-agent). Manage projects with dedicated profiles - each project its own context, no switching.

---

## How it works

```
┌────────────────────────────────────────────────────────────┐
│  LEADER (you)                                              │
│  cd ~/hive && pi                                           │
│  /dashboard → sees all projects + profiles                 │
└────────────────────────────────────────────────────────────┘
        │
        ├── web-app ──────────── frontend profile (cd web-app && pi)
        ├── api-service ─────── backend profile (cd api-service && pi)
        └── ios-app ─────────── mobile profile (cd ios-app && pi)
```

- **Project = profiles** (fixed, no switching)
- **Leader** monitors everything
- **Profiles** only see their project
- **Complete context isolation**

---

## Setup (step by step)

### 1. Install meta-hive CLI

```bash
git clone https://github.com/jitesh-ss/meta-hive ~/meta-hive
cd ~/meta-hive
npm install
npm link
npm run build
```

### 2. Install pi extension

```bash
mkdir -p ~/.pi/agent/extensions
cp -r ~/meta-hive/src/extension ~/.pi/agent/extensions/meta-hive
```

This copies the extension to pi's extension folder so the commands load automatically.

### 3. Create your hive folder

```bash
mkdir ~/hive
cd ~/hive
meta-hive init --name .meta-hive --profile leader
```

This creates `.meta-hive/` in your home directory.

### 4. Configure leader terminal

```bash
cd ~/hive
cat > hive-config.json << 'EOF'
{
  "profileName": "leader",
  "hivePath": ".meta-hive",
  "isLeader": true,
  "projects": [],
  "activeProject": null
}
EOF
```

### 5. Reload pi

```
/reload
```

---

## Your workflow

### 1. Create a project (leader terminal)

```
You: "Create a new project called web-app"
pi:  /new-project web-app

✅ Project "web-app" created!
Profile "web-app" is dedicated.

To work on it:
1. cd ~/web-app
2. Start pi
```

### 2. Work on the project (profile terminal)

```bash
mkdir -p ~/web-app
cd ~/web-app

cat > hive-config.json << 'EOF'
{
  "profileName": "web-app",
  "hivePath": ".meta-hive",
  "isLeader": false,
  "projects": ["web-app"],
  "activeProject": "web-app"
}
EOF
```

Then start pi: `pi`

```
You: "What am I working on?"
pi:  /projects

YOUR PROJECTS
--------------
[active] web-app
```

### 3. Monitor everything (leader terminal)

```
You: "Show me the dashboard"
pi:  /dashboard

HIVE DASHBOARD
----------------

Projects: 1
Profiles: 1

[active] web-app
   Profiles: web-app
```

---

## Profile switching

Each profile is in its own directory:

```bash
~/hive/          → pi → Leader (monitoring)
~/web-app/       → pi → web-app profile
~/api-service/   → pi → backend profile
~/ios-app/       → pi → mobile profile
```

To switch: `cd` to that directory, create `hive-config.json`, and start pi.

---

## Commands

| Command | Who | What |
|---------|-----|------|
| `/new-project <name>` | Leader | Create project + profile |
| `/dashboard` | Leader | See all projects + profiles |
| `/projects` | All | List your projects |
| `/profiles` | All | List all profiles |
| `/hive` | All | Quick status |
| `/meta-hive status` | All | Detailed status |
| `/meta-hive scan` | Leader | Refresh data |

## Conversational

```
"Create a new project for my frontend work"
"Show me the dashboard"
"What am I working on?"
"Who's in the hive?"
"What's the status?"
```

---

## Data structure

```
.meta-hive/
├── .hive-manifest.json     # All projects + profiles
├── leader/                 # Leader profile (you)
│   └── leader/
├── profiles/               # Project profiles
│   ├── web-app/
│   ├── api-service/
│   └── mobile/
├── projects/               # Project workspaces
│   ├── web-app/
│   ├── api-service/
│   └── mobile/
├── human/                  # Your preferences
└── shared/                 # Shared knowledge
```

Each profile directory has:
- `identity.md` - Who this profile is
- `projects.json` - Assigned projects

---

## Why?

```
Without meta-hive:
  → One agent juggling multiple projects
  → Context bleeding between projects
  → Manual prompt management

With meta-hive:
  → One profile per project
  → Isolated context
  → Conversational management
```

---

## License

MIT