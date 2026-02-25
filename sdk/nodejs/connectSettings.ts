import * as pulumi from "@pulumi/pulumi";

export interface ConnectSettingsArgs {
  /** WAN access type: 'DYNAMIC', 'ALWAYS', or 'DISABLED' */
  accessType: pulumi.Input<string>;
  /** Port forward type: 'UPNP' or 'STATIC' */
  forwardType?: pulumi.Input<string>;
  /** The port for remote access */
  port?: pulumi.Input<number>;
}

/**
 * Manages Unraid Connect remote access settings.
 *
 * ## Example Usage
 *
 * ```typescript
 * const connect = new unraid.ConnectSettings("remote-access", {
 *   accessType: "DYNAMIC",
 *   forwardType: "UPNP",
 *   port: 443,
 * });
 * ```
 */
export class ConnectSettings extends pulumi.CustomResource {
  declare readonly accessType: pulumi.Output<string>;
  declare readonly forwardType: pulumi.Output<string>;
  declare readonly port: pulumi.Output<number>;

  constructor(name: string, args: ConnectSettingsArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:ConnectSettings", name, args, opts);
  }
}
