import * as pulumi from "@pulumi/pulumi";

export interface OidcProviderArgs {
  /** Display name for the OIDC provider */
  name: pulumi.Input<string>;
  /** The OIDC issuer URL */
  issuerUrl: pulumi.Input<string>;
  /** The OIDC client ID */
  clientId: pulumi.Input<string>;
  /** The OIDC client secret */
  clientSecret?: pulumi.Input<string>;
  /** OAuth scopes to request */
  scopes?: pulumi.Input<pulumi.Input<string>[]>;
  /** The claim name for group membership */
  groupClaim?: pulumi.Input<string>;
  /** The group name that maps to admin role */
  adminGroup?: pulumi.Input<string>;
  /** Groups allowed to log in */
  allowedGroups?: pulumi.Input<pulumi.Input<string>[]>;
  /** Whether to auto-redirect to this provider */
  autoLogin?: pulumi.Input<boolean>;
  /** Whether to show button on login page */
  showOnLoginPage?: pulumi.Input<boolean>;
  /** Login button label text */
  buttonLabel?: pulumi.Input<string>;
  /** Login button background color */
  buttonColor?: pulumi.Input<string>;
  /** Login button text color */
  buttonTextColor?: pulumi.Input<string>;
  /** Login button icon */
  buttonIcon?: pulumi.Input<string>;
}

/**
 * Manages an OIDC/SSO provider configuration on the Unraid server
 * for single sign-on authentication.
 *
 * ## Example Usage
 *
 * ```typescript
 * const sso = new unraid.OidcProvider("authentik", {
 *   name: "Authentik",
 *   issuerUrl: "https://auth.example.com/application/o/unraid/",
 *   clientId: "unraid-client-id",
 *   clientSecret: "super-secret",
 *   scopes: ["openid", "profile", "email"],
 *   groupClaim: "groups",
 *   adminGroup: "unraid-admins",
 *   showOnLoginPage: true,
 *   buttonLabel: "Sign in with Authentik",
 *   buttonColor: "#fd4b2d",
 * });
 * ```
 */
export class OidcProvider extends pulumi.CustomResource {
  declare readonly name: pulumi.Output<string>;
  declare readonly issuerUrl: pulumi.Output<string>;
  declare readonly clientId: pulumi.Output<string>;
  declare readonly clientSecret: pulumi.Output<string>;
  declare readonly scopes: pulumi.Output<string[]>;
  declare readonly groupClaim: pulumi.Output<string>;
  declare readonly adminGroup: pulumi.Output<string>;
  declare readonly allowedGroups: pulumi.Output<string[]>;
  declare readonly autoLogin: pulumi.Output<boolean>;
  declare readonly showOnLoginPage: pulumi.Output<boolean>;
  declare readonly buttonLabel: pulumi.Output<string>;
  declare readonly buttonColor: pulumi.Output<string>;
  declare readonly buttonTextColor: pulumi.Output<string>;
  declare readonly buttonIcon: pulumi.Output<string>;

  constructor(name: string, args: OidcProviderArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:OidcProvider", name, {
      scopes: undefined,
      groupClaim: undefined,
      adminGroup: undefined,
      allowedGroups: undefined,
      autoLogin: undefined,
      showOnLoginPage: undefined,
      buttonLabel: undefined,
      buttonColor: undefined,
      buttonTextColor: undefined,
      buttonIcon: undefined,
      ...args,
    }, opts);
  }
}
