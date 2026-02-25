import * as pulumi from "@pulumi/pulumi";

export interface DockerFolderArgs {
  /** The folder name */
  name: pulumi.Input<string>;
  /** The folder icon */
  icon?: pulumi.Input<string>;
  /** Container names to include in this folder */
  containers?: pulumi.Input<pulumi.Input<string>[]>;
}

/**
 * Manages a Docker organizer folder on the Unraid WebUI.
 * Folders group containers for better visual organization.
 *
 * ## Example Usage
 *
 * ```typescript
 * const mediaFolder = new unraid.DockerFolder("media-apps", {
 *   name: "Media",
 *   icon: "fa-film",
 *   containers: ["plex", "sonarr", "radarr", "lidarr"],
 * });
 * ```
 */
export class DockerFolder extends pulumi.CustomResource {
  declare readonly name: pulumi.Output<string>;
  declare readonly icon: pulumi.Output<string>;
  declare readonly containers: pulumi.Output<string[]>;
  declare readonly expanded: pulumi.Output<boolean>;

  constructor(name: string, args: DockerFolderArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:DockerFolder", name, {
      expanded: undefined,
      ...args,
    }, opts);
  }
}
