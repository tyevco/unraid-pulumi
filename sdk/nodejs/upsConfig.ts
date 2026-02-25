import * as pulumi from "@pulumi/pulumi";

export interface UpsConfigArgs {
  /** UPS service state: 'ENABLE' or 'DISABLE' */
  service: pulumi.Input<string>;
  /** UPS cable type (USB, SIMPLE, SMART, ETHER, CUSTOM) */
  upsCable?: pulumi.Input<string>;
  /** Custom UPS cable specification (when upsCable is CUSTOM) */
  customUpsCable?: pulumi.Input<string>;
  /** UPS type (USB, APCSMART, NET, SNMP, DUMB, PCNET, MODBUS) */
  upsType?: pulumi.Input<string>;
  /** UPS device path */
  device?: pulumi.Input<string>;
  /** Battery level threshold for shutdown (percentage) */
  batteryLevel?: pulumi.Input<number>;
  /** Minutes of battery runtime before shutdown */
  minutes?: pulumi.Input<number>;
  /** Timeout in seconds */
  timeout?: pulumi.Input<number>;
  /** Whether to kill UPS power after shutdown: 'YES' or 'NO' */
  killUps?: pulumi.Input<string>;
}

/**
 * Manages UPS (Uninterruptible Power Supply) configuration on the Unraid server.
 *
 * ## Example Usage
 *
 * ```typescript
 * const ups = new unraid.UpsConfig("main-ups", {
 *   service: "ENABLE",
 *   upsCable: "USB",
 *   upsType: "USB",
 *   batteryLevel: 10,
 *   minutes: 3,
 * });
 * ```
 */
export class UpsConfig extends pulumi.CustomResource {
  declare readonly service: pulumi.Output<string>;
  declare readonly upsCable: pulumi.Output<string>;
  declare readonly customUpsCable: pulumi.Output<string>;
  declare readonly upsType: pulumi.Output<string>;
  declare readonly device: pulumi.Output<string>;
  declare readonly batteryLevel: pulumi.Output<number>;
  declare readonly minutes: pulumi.Output<number>;
  declare readonly timeout: pulumi.Output<number>;
  declare readonly killUps: pulumi.Output<string>;

  constructor(name: string, args: UpsConfigArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:UpsConfig", name, args, opts);
  }
}
