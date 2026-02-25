import fetch from "cross-fetch";

export interface DockgeClientConfig {
  url: string;
  apiKey: string;
  verifySsl?: boolean;
}

let currentConfig: DockgeClientConfig | null = null;

export function configureDockgeClient(config: DockgeClientConfig): void {
  currentConfig = config;
}

export function getDockgeConfig(): DockgeClientConfig | null {
  return currentConfig;
}

function getBaseUrl(): string {
  if (!currentConfig) {
    throw new Error("Dockge provider not configured. Set dockgeUrl and dockgeApiKey.");
  }
  return currentConfig.url.replace(/\/+$/, "");
}

function getHeaders(): Record<string, string> {
  if (!currentConfig) {
    throw new Error("Dockge provider not configured.");
  }
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${currentConfig.apiKey}`,
  };
}

async function request<T = any>(method: string, path: string, body?: any): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const options: RequestInit = {
    method,
    headers: getHeaders(),
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Dockge API ${method} ${path} failed (${response.status}): ${text}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as unknown as T;
}

// --- Stack types ---

export interface DockgeStackInfo {
  name: string;
  status: string;
  composeYaml: string;
  envFile?: string;
  containers?: DockgeContainerInfo[];
}

export interface DockgeContainerInfo {
  name: string;
  image: string;
  state: string;
  status: string;
}

// --- Stack API ---

export async function listStacks(): Promise<DockgeStackInfo[]> {
  return request<DockgeStackInfo[]>("GET", "/api/stacks");
}

export async function getStack(name: string): Promise<DockgeStackInfo> {
  return request<DockgeStackInfo>("GET", `/api/stacks/${encodeURIComponent(name)}`);
}

export async function createStack(input: {
  name: string;
  composeYaml: string;
  envFile?: string;
  start?: boolean;
}): Promise<DockgeStackInfo> {
  return request<DockgeStackInfo>("POST", "/api/stacks", input);
}

export async function updateStack(name: string, input: {
  composeYaml: string;
  envFile?: string;
}): Promise<DockgeStackInfo> {
  return request<DockgeStackInfo>("PUT", `/api/stacks/${encodeURIComponent(name)}`, input);
}

export async function deleteStack(name: string): Promise<void> {
  await request("DELETE", `/api/stacks/${encodeURIComponent(name)}`);
}

export async function startStack(name: string): Promise<DockgeStackInfo> {
  return request<DockgeStackInfo>("POST", `/api/stacks/${encodeURIComponent(name)}/start`);
}

export async function stopStack(name: string): Promise<DockgeStackInfo> {
  return request<DockgeStackInfo>("POST", `/api/stacks/${encodeURIComponent(name)}/stop`);
}
