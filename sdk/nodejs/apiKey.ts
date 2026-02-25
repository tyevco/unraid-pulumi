import * as pulumi from "@pulumi/pulumi";

export interface PermissionArgs {
  /** The resource this permission applies to (e.g., ARRAY, DOCKER, VMS, SHARE) */
  resource: pulumi.Input<string>;
  /** The actions allowed on this resource */
  actions: pulumi.Input<pulumi.Input<string>[]>;
}

export interface ApiKeyArgs {
  /** The display name for the API key */
  name: pulumi.Input<string>;
  /** A description of what this API key is used for */
  description?: pulumi.Input<string>;
  /** Roles assigned to this API key (ADMIN, CONNECT, GUEST, VIEWER) */
  roles: pulumi.Input<pulumi.Input<string>[]>;
  /** Specific permissions assigned to this API key */
  permissions?: pulumi.Input<pulumi.Input<PermissionArgs>[]>;
}

/**
 * Manages an API key on the Unraid server. API keys provide authentication
 * for programmatic access to the Unraid API.
 *
 * ## Example Usage
 *
 * ```typescript
 * const key = new unraid.ApiKey("my-key", {
 *   name: "automation-key",
 *   description: "Key for automation scripts",
 *   roles: ["ADMIN"],
 * });
 * ```
 */
export class ApiKey extends pulumi.CustomResource {
  declare readonly name: pulumi.Output<string>;
  declare readonly description: pulumi.Output<string>;
  declare readonly roles: pulumi.Output<string[]>;
  declare readonly permissions: pulumi.Output<PermissionArgs[]>;
  /** The generated API key value. Only available at creation time. */
  declare readonly key: pulumi.Output<string>;

  constructor(name: string, args: ApiKeyArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:ApiKey", name, {
      key: undefined,
      ...args,
    }, opts);
  }
}
