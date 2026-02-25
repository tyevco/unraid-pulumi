import * as pulumi from "@pulumi/pulumi";

export interface VirtualMachineArgs {
  /** The ID of the virtual machine to manage */
  vmId: pulumi.Input<string>;
  /** The desired state: 'started', 'stopped', or 'paused' */
  state: pulumi.Input<string>;
}

/**
 * Manages the state of a virtual machine on the Unraid server.
 * Controls whether a VM is running, stopped, or paused.
 *
 * ## Example Usage
 *
 * ```typescript
 * const vm = new unraid.VirtualMachine("windows-vm", {
 *   vmId: "vm-abc123...",
 *   state: "started",
 * });
 * ```
 */
export class VirtualMachine extends pulumi.CustomResource {
  declare readonly vmId: pulumi.Output<string>;
  declare readonly state: pulumi.Output<string>;
  declare readonly name: pulumi.Output<string>;
  declare readonly coreCount: pulumi.Output<number>;
  declare readonly threadCount: pulumi.Output<number>;

  constructor(name: string, args: VirtualMachineArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:VirtualMachine", name, {
      name: undefined,
      coreCount: undefined,
      threadCount: undefined,
      ...args,
    }, opts);
  }
}
