import * as pulumi from "@pulumi/pulumi";

export interface ArrayStateArgs {
  /** The desired state of the array: 'START' or 'STOP' */
  state: pulumi.Input<string>;
}

/**
 * Manages the state of the Unraid disk array.
 * Controls whether the array is started or stopped.
 *
 * ## Example Usage
 *
 * ```typescript
 * const array = new unraid.ArrayState("main-array", {
 *   state: "START",
 * });
 * ```
 */
export class ArrayState extends pulumi.CustomResource {
  declare readonly state: pulumi.Output<string>;
  declare readonly arrayState: pulumi.Output<string>;
  declare readonly capacity: pulumi.Output<{ kilobytes?: string; disks?: number }>;

  constructor(name: string, args: ArrayStateArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:ArrayState", name, {
      arrayState: undefined,
      capacity: undefined,
      ...args,
    }, opts);
  }
}
