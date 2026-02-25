import * as pulumi from "@pulumi/pulumi";

export interface ThemeArgs {
  /** The theme name: 'azure', 'black', 'gray', or 'white' */
  theme: pulumi.Input<string>;
}

/**
 * Manages the Unraid WebUI theme/customization.
 *
 * ## Example Usage
 *
 * ```typescript
 * const theme = new unraid.Theme("dark-theme", {
 *   theme: "black",
 * });
 * ```
 */
export class Theme extends pulumi.CustomResource {
  declare readonly theme: pulumi.Output<string>;
  declare readonly banner: pulumi.Output<boolean>;
  declare readonly bannerGradient: pulumi.Output<boolean>;

  constructor(name: string, args: ThemeArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:Theme", name, {
      banner: undefined,
      bannerGradient: undefined,
      ...args,
    }, opts);
  }
}
