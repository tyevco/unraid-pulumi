import * as pulumi from "@pulumi/pulumi";
import * as unraid from "@pulumi/unraid";

// ──────────────────────────────────────────────
// Provider Configuration
// Set these via: pulumi config set unraid:serverUrl http://YOUR_SERVER_IP
//                pulumi config set --secret unraid:apiKey YOUR_API_KEY
// ──────────────────────────────────────────────

// Alternatively, create an explicit provider instance:
// const provider = new unraid.Provider("my-server", {
//   serverUrl: "http://192.168.1.100",
//   apiKey: "your-api-key-here",
// });

// ──────────────────────────────────────────────
// Data Sources - Query your Unraid server
// ──────────────────────────────────────────────

// Get system information
const sysInfo = unraid.getSystemInfoOutput();
export const hostname = sysInfo.hostname;
export const unraidVersion = sysInfo.version;

// List all Docker containers
const containers = unraid.getDockerContainersOutput();
export const containerNames = containers.containers.apply(cs =>
  cs.map(c => `${c.name} (${c.state})`)
);

// List all VMs
const vms = unraid.getVirtualMachinesOutput();
export const vmNames = vms.vms.apply(vs =>
  vs.map(v => `${v.name} (${v.state})`)
);

// Get array status
const arrayStatus = unraid.getArrayStatusOutput();
export const arrayState = arrayStatus.state;
export const diskCount = arrayStatus.diskCount;

// Get shares
const shares = unraid.getSharesOutput();
export const shareNames = shares.shares.apply(ss => ss.map(s => s.name));

// ──────────────────────────────────────────────
// Resources - Manage your Unraid server
// ──────────────────────────────────────────────

// Create an API key for automation
const automationKey = new unraid.ApiKey("automation", {
  name: "pulumi-automation",
  description: "API key managed by Pulumi for automation scripts",
  roles: ["VIEWER"],
});
export const apiKeyId = automationKey.id;

// Ensure the array is started
const array = new unraid.ArrayState("main-array", {
  state: "START",
});

// Manage Docker container state
// First discover container IDs using getDockerContainers(), then:
//
// const plex = new unraid.DockerContainer("plex", {
//   containerId: "container-id-from-getDockerContainers",
//   state: "started",
// });
//
// const plexAutostart = new unraid.DockerAutostart("plex-autostart", {
//   containerId: "container-id-from-getDockerContainers",
//   autoStart: true,
//   wait: 5,
// });

// Manage VM state
// First discover VM IDs using getVirtualMachines(), then:
//
// const windowsVm = new unraid.VirtualMachine("windows", {
//   vmId: "vm-id-from-getVirtualMachines",
//   state: "started",
// });

// Set the WebUI theme
const theme = new unraid.Theme("dark-mode", {
  theme: "black",
});

// Configure UPS monitoring
// const ups = new unraid.UpsConfig("main-ups", {
//   service: "ENABLE",
//   upsCable: "USB",
//   upsType: "USB",
//   batteryLevel: 10,
//   minutes: 3,
// });

// Send a notification when deployment completes
const deployNotification = new unraid.Notification("deploy-complete", {
  title: "Pulumi Deployment",
  subject: "Infrastructure Update",
  message: "Pulumi has successfully configured your Unraid server.",
  importance: "INFO",
});
