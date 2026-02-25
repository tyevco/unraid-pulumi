import * as pulumi from "@pulumi/pulumi";

export interface PluginArgs {
  /** The plugin name or URL to install */
  name: pulumi.Input<string>;
  /** Whether to restart the server after plugin installation (default: false) */
  restart?: pulumi.Input<boolean>;
}

/**
 * Manages a plugin installation on the Unraid server.
 *
 * ## Example Usage
 *
 * ```typescript
 * const plugin = new unraid.Plugin("community-apps", {
 *   name: "community.applications.plg",
 * });
 * ```
 */
export class Plugin extends pulumi.CustomResource {
  declare readonly name: pulumi.Output<string>;
  declare readonly restart: pulumi.Output<boolean>;

  constructor(name: string, args: PluginArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:Plugin", name, args, opts);
  }
}
