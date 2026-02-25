import * as pulumi from "@pulumi/pulumi";

export interface DockerContainerArgs {
  /** The ID of the Docker container to manage */
  containerId: pulumi.Input<string>;
  /** The desired state: 'started', 'stopped', or 'paused' */
  state: pulumi.Input<string>;
}

/**
 * Manages the state of a Docker container on the Unraid server.
 * This resource controls whether a container is running, stopped, or paused.
 *
 * ## Example Usage
 *
 * ```typescript
 * const container = new unraid.DockerContainer("plex", {
 *   containerId: "abc123...",
 *   state: "started",
 * });
 * ```
 */
export class DockerContainer extends pulumi.CustomResource {
  declare readonly containerId: pulumi.Output<string>;
  declare readonly state: pulumi.Output<string>;
  declare readonly name: pulumi.Output<string>;
  declare readonly image: pulumi.Output<string>;
  declare readonly status: pulumi.Output<string>;

  constructor(name: string, args: DockerContainerArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:DockerContainer", name, {
      name: undefined,
      image: undefined,
      status: undefined,
      ...args,
    }, opts);
  }
}

export interface DockerAutostartArgs {
  /** The ID of the Docker container */
  containerId: pulumi.Input<string>;
  /** Whether the container should automatically start when the array starts */
  autoStart: pulumi.Input<boolean>;
  /** Seconds to wait after starting this container before starting the next one */
  wait?: pulumi.Input<number>;
}

/**
 * Manages autostart configuration for a Docker container on the Unraid server.
 *
 * ## Example Usage
 *
 * ```typescript
 * const autostart = new unraid.DockerAutostart("plex-autostart", {
 *   containerId: "abc123...",
 *   autoStart: true,
 *   wait: 5,
 * });
 * ```
 */
export class DockerAutostart extends pulumi.CustomResource {
  declare readonly containerId: pulumi.Output<string>;
  declare readonly autoStart: pulumi.Output<boolean>;
  declare readonly wait: pulumi.Output<number>;

  constructor(name: string, args: DockerAutostartArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:DockerAutostart", name, args, opts);
  }
}
