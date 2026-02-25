import * as pulumi from "@pulumi/pulumi";

export interface DockgeContainerInfo {
  /** Container name */
  name: string;
  /** Container image */
  image: string;
  /** Container state (running, exited, etc.) */
  state: string;
  /** Human-readable container status */
  status: string;
}

export interface DockgeStackArgs {
  /** The name of the compose stack. Must be unique within the Dockge instance. */
  name: pulumi.Input<string>;
  /** The Docker Compose YAML content for this stack. */
  composeYaml: pulumi.Input<string>;
  /** The .env file content for this stack. Can contain secrets. */
  envFile?: pulumi.Input<string>;
  /** Whether the stack should be running (default: true). */
  running?: pulumi.Input<boolean>;
}

/**
 * Manages a Docker Compose stack via a Dockge instance.
 *
 * Dockge provides a lightweight UI and REST API for managing compose stacks.
 * This resource syncs compose YAML and .env files to Dockge and controls
 * stack lifecycle.
 *
 * ## Example Usage
 *
 * ```typescript
 * const plex = new unraid.DockgeStack("plex", {
 *   name: "plex",
 *   composeYaml: `
 * services:
 *   plex:
 *     image: linuxserver/plex:latest
 *     ports:
 *       - "32400:32400"
 *     volumes:
 *       - /mnt/user/media:/media
 * `,
 *   envFile: "PUID=1000\nPGID=1000\nTZ=America/New_York",
 *   running: true,
 * });
 * ```
 *
 * ## Dynamic Stack Loading
 *
 * ```typescript
 * import * as fs from "fs";
 * import * as path from "path";
 *
 * const stacksDir = "./stacks";
 * for (const name of fs.readdirSync(stacksDir)) {
 *   const composePath = path.join(stacksDir, name, "compose.yaml");
 *   const envPath = path.join(stacksDir, name, ".env");
 *   if (!fs.existsSync(composePath)) continue;
 *
 *   new unraid.DockgeStack(name, {
 *     name,
 *     composeYaml: fs.readFileSync(composePath, "utf-8"),
 *     envFile: fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : undefined,
 *     running: true,
 *   });
 * }
 * ```
 */
export class DockgeStack extends pulumi.CustomResource {
  declare readonly name: pulumi.Output<string>;
  declare readonly composeYaml: pulumi.Output<string>;
  declare readonly envFile: pulumi.Output<string>;
  declare readonly running: pulumi.Output<boolean>;
  declare readonly status: pulumi.Output<string>;
  declare readonly containers: pulumi.Output<DockgeContainerInfo[]>;

  constructor(name: string, args: DockgeStackArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:DockgeStack", name, {
      ...args,
      running: args.running ?? true,
      // Outputs
      status: undefined,
      containers: undefined,
    }, opts);
  }
}
