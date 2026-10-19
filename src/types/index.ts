export interface Profile {
  name: string;
  identity: ProfileIdentity;
  projects: string[];
  isLeader: boolean;
  createdAt?: string;
  lastActive?: string;
}

export interface ProfileIdentity {
  name: string;
  description: string;
  personality?: string;
  capabilities?: string[];
}

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

export interface HiveConfig {
  hivePath: string;
  profileName: string;
  isLeader: boolean;
  projects: string[];
  activeProject: string | null;
}

export interface ScanResult {
  profiles: Profile[];
  projects: string[];
  lastScan: string;
  insights?: string[];
}