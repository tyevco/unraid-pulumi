import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";
import * as unraid from "@pulumi/unraid";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Dynamic Dockge Stack Loader
//
// Scans the stacks/ directory and creates a DockgeStack resource for each one.
// Supports .env files with three value types:
//
//   KEY=value          -> used as-is (plain config)
//   KEY=GENERATE       -> generates a random 32-char password, stable in state
//   KEY=<anything>     -> can be overridden via pulumi config secrets
//
// Secret priority (highest wins):
//   1. Pulumi config secrets   (pulumi config set --secret stacks:<name>.<KEY> val)
//   2. GENERATE                (random.RandomPassword, created once)
//   3. Literal value from .env
// ---------------------------------------------------------------------------

const stacksDir = path.join(__dirname, "stacks");
const stacksConfig = new pulumi.Config("stacks");

for (const stackName of fs.readdirSync(stacksDir)) {
  const dir = path.join(stacksDir, stackName);
  const composePath = path.join(dir, "compose.yaml");

  // Skip non-stack directories
  if (!fs.statSync(dir).isDirectory()) continue;
  if (!fs.existsSync(composePath)) continue;

  const composeYaml = fs.readFileSync(composePath, "utf-8");

  // Parse .env file into key-value pairs
  const envPath = path.join(dir, ".env");
  const envVars: Record<string, pulumi.Input<string>> = {};

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");

    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;

      const key = trimmed.substring(0, eqIndex).trim();
      const value = trimmed.substring(eqIndex + 1).trim();

      if (value === "GENERATE") {
        // Generate a stable random password
        const pw = new random.RandomPassword(`${stackName}-${key}`, {
          length: 32,
          special: false,
        });
        envVars[key] = pw.result;
      } else {
        envVars[key] = value;
      }
    }
  }

  // Override with secrets from pulumi config if they exist
  const configSecrets = stacksConfig.getSecretObject<Record<string, string>>(stackName);

  // Build the final .env content
  const envFile = configSecrets
    ? pulumi.all([envVars, configSecrets]).apply(([vars, secrets]) => {
        const merged = { ...vars, ...secrets };
        return Object.entries(merged)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n");
      })
    : pulumi.all(envVars).apply((vars) =>
        Object.entries(vars)
          .map(([k, v]) => `${k}=${v}`)
          .join("\n")
      );

  const stack = new unraid.DockgeStack(stackName, {
    name: stackName,
    composeYaml,
    envFile,
    running: true,
  });

  // Export stack status
  pulumi.all([stack.name, stack.status]).apply(([name, status]) => {
    pulumi.log.info(`Stack ${name}: ${status}`);
  });
}
