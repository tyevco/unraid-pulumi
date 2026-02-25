// Pulumi SDK for Unraid - manages Unraid servers via the GraphQL API

// Provider
export { Provider, ProviderArgs } from "./provider";

// Resources
export { ApiKey, ApiKeyArgs, PermissionArgs } from "./apiKey";
export { DockerContainer, DockerContainerArgs, DockerAutostart, DockerAutostartArgs } from "./dockerContainer";
export { VirtualMachine, VirtualMachineArgs } from "./virtualMachine";
export { ArrayState, ArrayStateArgs } from "./arrayState";
export { Notification, NotificationArgs } from "./notification";
export { RcloneRemote, RcloneRemoteArgs } from "./rcloneRemote";
export { UpsConfig, UpsConfigArgs } from "./upsConfig";
export { Plugin, PluginArgs } from "./plugin";
export { Theme, ThemeArgs } from "./theme";
export { ConnectSettings, ConnectSettingsArgs } from "./connectSettings";

// Data Source Functions
export {
  getSystemInfo, getSystemInfoOutput, GetSystemInfoResult,
  getDockerContainers, getDockerContainersOutput, GetDockerContainersResult, DockerContainerInfo, ContainerPort,
  getVirtualMachines, getVirtualMachinesOutput, GetVirtualMachinesResult, VmDomainInfo,
  getShares, getSharesOutput, GetSharesResult, ShareInfo,
  getArrayStatus, getArrayStatusOutput, GetArrayStatusResult, ArrayDiskInfo,
  getDisks, getDisksOutput, GetDisksResult,
  getNotifications, getNotificationsOutput, GetNotificationsResult, NotificationInfo,
  getUpsStatus, getUpsStatusOutput, GetUpsStatusResult, UpsDeviceInfo,
  getNetwork, getNetworkOutput, GetNetworkResult, AccessUrlInfo,
} from "./getters";
