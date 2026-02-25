import * as pulumi from "@pulumi/pulumi";

export interface NotificationArgs {
  /** The title of the notification */
  title: pulumi.Input<string>;
  /** The subject line of the notification */
  subject: pulumi.Input<string>;
  /** The notification message body */
  message: pulumi.Input<string>;
  /** The importance level: 'ALERT', 'WARNING', or 'INFO' */
  importance: pulumi.Input<string>;
  /** An optional link URL associated with the notification */
  link?: pulumi.Input<string>;
}

/**
 * Creates a notification on the Unraid server.
 *
 * ## Example Usage
 *
 * ```typescript
 * const alert = new unraid.Notification("deploy-alert", {
 *   title: "Deployment Complete",
 *   subject: "Infrastructure Update",
 *   message: "Pulumi deployment finished successfully.",
 *   importance: "INFO",
 * });
 * ```
 */
export class Notification extends pulumi.CustomResource {
  declare readonly title: pulumi.Output<string>;
  declare readonly subject: pulumi.Output<string>;
  declare readonly message: pulumi.Output<string>;
  declare readonly importance: pulumi.Output<string>;
  declare readonly link: pulumi.Output<string>;
  declare readonly timestamp: pulumi.Output<string>;
  declare readonly notificationType: pulumi.Output<string>;

  constructor(name: string, args: NotificationArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:Notification", name, {
      timestamp: undefined,
      notificationType: undefined,
      ...args,
    }, opts);
  }
}
