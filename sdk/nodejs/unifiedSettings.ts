import * as pulumi from "@pulumi/pulumi";

export interface UnifiedSettingsArgs {
  /**
   * The settings values to apply. Must conform to the server's dataSchema.
   * Use getSettings() to discover available settings and their current values.
   */
  values: pulumi.Input<Record<string, any>>;
}

/**
 * Manages the unified settings system on the Unraid server.
 * This provides access to the JSON Schema-based settings, which may include
 * plugin configurations and system settings.
 *
 * ## Example Usage
 *
 * ```typescript
 * // First discover available settings
 * const currentSettings = unraid.getSettingsOutput();
 * export const settingsSchema = currentSettings.dataSchema;
 *
 * // Then apply specific settings
 * const settings = new unraid.UnifiedSettings("my-settings", {
 *   values: {
 *     "someSection": {
 *       "someSetting": "newValue",
 *     },
 *   },
 * });
 * ```
 */
export class UnifiedSettings extends pulumi.CustomResource {
  declare readonly values: pulumi.Output<Record<string, any>>;
  /** The JSON Schema describing available settings fields. */
  declare readonly dataSchema: pulumi.Output<Record<string, any>>;
  /** The UI schema for rendering the settings form. */
  declare readonly uiSchema: pulumi.Output<Record<string, any>>;
  /** Whether a server restart is required after applying these settings. */
  declare readonly restartRequired: pulumi.Output<boolean>;
  /** Any warnings from the settings update. */
  declare readonly warnings: pulumi.Output<string[]>;

  constructor(name: string, args: UnifiedSettingsArgs, opts?: pulumi.CustomResourceOptions) {
    super("unraid:index:UnifiedSettings", name, {
      dataSchema: undefined,
      uiSchema: undefined,
      restartRequired: undefined,
      warnings: undefined,
      ...args,
    }, opts);
  }
}
