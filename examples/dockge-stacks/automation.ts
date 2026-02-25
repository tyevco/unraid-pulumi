import { LocalWorkspace } from "@pulumi/pulumi/automation";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Automation API wrapper for Dockge Stacks
//
// This script uses the Pulumi Automation API to:
//   1. Scan stacks/ directories for .env files
//   2. Import each env var as a Pulumi secret (first-time seed)
//   3. Run `pulumi up` to deploy all stacks
//
// Usage:
//   npx ts-node automation.ts [preview|up|destroy]
//
// After first run, .env files can be gitignored — secrets live in Pulumi state.
// To update a secret: pulumi config set --secret stacks:<stackName>.<KEY> <value>
// ---------------------------------------------------------------------------

const stacksDir = path.join(__dirname, "stacks");

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, "utf-8");
  const vars: Record<string, string> = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();

    // Skip GENERATE values — those are handled by the Pulumi program
    if (value === "GENERATE") continue;

    vars[key] = value;
  }

  return vars;
}

async function main() {
  const command = process.argv[2] || "preview";

  const stack = await LocalWorkspace.createOrSelectStack({
    stackName: "prod",
    workDir: __dirname,
  });

  console.log("Seeding secrets from .env files...\n");

  // Seed secrets from .env files
  for (const stackName of fs.readdirSync(stacksDir)) {
    const dir = path.join(stacksDir, stackName);
    const envPath = path.join(dir, ".env");

    if (!fs.statSync(dir).isDirectory()) continue;
    if (!fs.existsSync(envPath)) continue;

    const vars = parseEnvFile(envPath);
    const secretVars: Record<string, string> = {};
    let seeded = 0;

    for (const [key, value] of Object.entries(vars)) {
      // Only seed if not already in config
      const configKey = `stacks:${stackName}.${key}`;
      try {
        await stack.getConfig(configKey);
        // Already exists, skip
      } catch {
        // Doesn't exist yet, seed it
        await stack.setConfig(configKey, { value, secret: true });
        secretVars[key] = value;
        seeded++;
      }
    }

    if (seeded > 0) {
      console.log(`  ${stackName}: seeded ${seeded} secret(s) - ${Object.keys(secretVars).join(", ")}`);
    } else {
      console.log(`  ${stackName}: all secrets already in config`);
    }
  }

  console.log("");

  // Run the requested command
  switch (command) {
    case "preview": {
      console.log("Running pulumi preview...\n");
      const result = await stack.preview({ onOutput: console.log });
      console.log("\nChanges:", result.changeSummary);
      break;
    }
    case "up": {
      console.log("Running pulumi up...\n");
      const result = await stack.up({ onOutput: console.log });
      console.log("\nSummary:", result.summary);
      break;
    }
    case "destroy": {
      console.log("Running pulumi destroy...\n");
      const result = await stack.destroy({ onOutput: console.log });
      console.log("\nSummary:", result.summary);
      break;
    }
    default:
      console.error(`Unknown command: ${command}. Use: preview, up, or destroy`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
