import * as pulumi from "@pulumi/pulumi";

/**
 * The provider type for the Unraid package. By default, resources use package-wide configuration
 * settings, however an explicit `Provider` instance may be created and passed during resource
 * construction to achieve fine-grained programmatic control over provider settings.
 */
export class Provider extends pulumi.ProviderResource {
  declare readonly serverUrl: pulumi.Output<string>;
  declare readonly apiKey: pulumi.Output<string>;
  declare readonly verifySsl: pulumi.Output<boolean>;

  constructor(name: string, args: ProviderArgs, opts?: pulumi.ResourceOptions) {
    const inputs: pulumi.Inputs = {
      serverUrl: args.serverUrl,
      apiKey: args.apiKey,
      verifySsl: args.verifySsl ?? true,
    };
    super("unraid", name, inputs, opts);
  }
}

export interface ProviderArgs {
  /** The URL of the Unraid server (e.g., http://192.168.1.100 or https://tower.local) */
  serverUrl: pulumi.Input<string>;
  /** API key for authenticating with the Unraid GraphQL API */
  apiKey: pulumi.Input<string>;
  /** Whether to verify SSL certificates (default: true) */
  verifySsl?: pulumi.Input<boolean>;
}
