import * as pulumi from "@pulumi/pulumi";

export interface RcloneRemoteArgs {
  /** The name of the RClone remote */
  name: pulumi.Input<string>;
  /** The type of RClone remote (e.g., 's3', 'b2', 'drive', 'dropbox') */
  remoteType: pulumi.Input<string>;
  /** Configuration parameters for the remote (varies by remote type) */
  parameters?: pulumi.Input<Record<string, pulumi.Input<string>>>;
}

/**
 * Manages an RClone remote configuration for backup operations on the Unraid server.
 *
 * ## Example Usage
 *
 * ```typescript
 * const backup = new unraid.RcloneRemote("s3-backup", {
 *   name: "my-s3-backup",
 *   remoteType: "s3",
 *   parameters: {
 *     provider: "AWS",
 *     region: "us-east-1",
 *     access_key_id: "AKIA...",
 *     secret_access_key: "secret...",
 *   },
 * });
 * ```
 */
export class RcloneRemote extends pulumi.CustomResource {
  declare readonly name: pulumi.Output<string>;
  declare readonly remoteType: pulumi.Output<string>;
  declare readonly parameters: pulumi.Output<Record<string, string>>;

  constructor(name: string, args: RcloneRemoteArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:RcloneRemote", name, args, opts);
  }
}
