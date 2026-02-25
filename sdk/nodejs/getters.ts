import * as pulumi from "@pulumi/pulumi";

// --- getSystemInfo ---

export interface GetSystemInfoResult {
  hostname: string;
  version: string;
  cpuModel: string;
  cpuCores: number;
  cpuThreads: number;
  memoryTotal: string;
  motherboard: string;
}

/** Get comprehensive system information from the Unraid server. */
export function getSystemInfo(opts?: pulumi.InvokeOptions): Promise<GetSystemInfoResult> {
  return pulumi.runtime.invoke("unraid:index:getSystemInfo", {}, opts);
}

export function getSystemInfoOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetSystemInfoResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getSystemInfo", {}, opts);
}

// --- getDockerContainers ---

export interface ContainerPort {
  ip: string;
  privatePort: number;
  publicPort: number;
  type: string;
}

export interface DockerContainerInfo {
  id: string;
  name: string;
  state: string;
  status: string;
  image: string;
  autoStart: boolean;
  ports: ContainerPort[];
}

export interface GetDockerContainersResult {
  containers: DockerContainerInfo[];
}

/** List all Docker containers on the Unraid server. */
export function getDockerContainers(opts?: pulumi.InvokeOptions): Promise<GetDockerContainersResult> {
  return pulumi.runtime.invoke("unraid:index:getDockerContainers", {}, opts);
}

export function getDockerContainersOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetDockerContainersResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getDockerContainers", {}, opts);
}

// --- getVirtualMachines ---

export interface VmDomainInfo {
  id: string;
  name: string;
  state: string;
  coreCount: number;
  threadCount: number;
  memorySize: string;
}

export interface GetVirtualMachinesResult {
  vms: VmDomainInfo[];
}

/** List all virtual machines on the Unraid server. */
export function getVirtualMachines(opts?: pulumi.InvokeOptions): Promise<GetVirtualMachinesResult> {
  return pulumi.runtime.invoke("unraid:index:getVirtualMachines", {}, opts);
}

export function getVirtualMachinesOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetVirtualMachinesResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getVirtualMachines", {}, opts);
}

// --- getShares ---

export interface ShareInfo {
  name: string;
  comment: string;
  allocator: string;
  floor: string;
  splitLevel: string;
  free: string;
  size: string;
  used: string;
  cachePool: string;
  useCache: string;
  color: string;
}

export interface GetSharesResult {
  shares: ShareInfo[];
}

/** List all user shares on the Unraid server. */
export function getShares(opts?: pulumi.InvokeOptions): Promise<GetSharesResult> {
  return pulumi.runtime.invoke("unraid:index:getShares", {}, opts);
}

export function getSharesOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetSharesResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getShares", {}, opts);
}

// --- getArrayStatus ---

export interface ArrayDiskInfo {
  id: string;
  name: string;
  device: string;
  type: string;
  status: string;
  size: string;
  fsType: string;
  temp: number;
  numReads: string;
  numWrites: string;
  numErrors: number;
  color: string;
}

export interface GetArrayStatusResult {
  state: string;
  capacity: string;
  diskCount: number;
  disks: ArrayDiskInfo[];
  parities: ArrayDiskInfo[];
  caches: ArrayDiskInfo[];
}

/** Get the current status of the Unraid disk array. */
export function getArrayStatus(opts?: pulumi.InvokeOptions): Promise<GetArrayStatusResult> {
  return pulumi.runtime.invoke("unraid:index:getArrayStatus", {}, opts);
}

export function getArrayStatusOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetArrayStatusResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getArrayStatus", {}, opts);
}

// --- getDisks ---

export interface GetDisksResult {
  disks: ArrayDiskInfo[];
}

/** List all physical disks on the Unraid server. */
export function getDisks(opts?: pulumi.InvokeOptions): Promise<GetDisksResult> {
  return pulumi.runtime.invoke("unraid:index:getDisks", {}, opts);
}

export function getDisksOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetDisksResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getDisks", {}, opts);
}

// --- getNotifications ---

export interface NotificationInfo {
  id: string;
  title: string;
  subject: string;
  description: string;
  importance: string;
  timestamp: string;
}

export interface GetNotificationsResult {
  notifications: NotificationInfo[];
}

/** List notifications on the Unraid server. */
export function getNotifications(opts?: pulumi.InvokeOptions): Promise<GetNotificationsResult> {
  return pulumi.runtime.invoke("unraid:index:getNotifications", {}, opts);
}

export function getNotificationsOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetNotificationsResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getNotifications", {}, opts);
}

// --- getUpsStatus ---

export interface UpsDeviceInfo {
  id: string;
  name: string;
  status: string;
  batteryCharge: number;
  batteryRuntime: number;
  inputVoltage: number;
  outputVoltage: number;
  load: number;
}

export interface GetUpsStatusResult {
  devices: UpsDeviceInfo[];
}

/** Get UPS device status information. */
export function getUpsStatus(opts?: pulumi.InvokeOptions): Promise<GetUpsStatusResult> {
  return pulumi.runtime.invoke("unraid:index:getUpsStatus", {}, opts);
}

export function getUpsStatusOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetUpsStatusResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getUpsStatus", {}, opts);
}

// --- getNetwork ---

export interface AccessUrlInfo {
  type: string;
  name: string;
  ipv4: string;
  ipv6: string;
}

export interface GetNetworkResult {
  accessUrls: AccessUrlInfo[];
}

/** Get network information and access URLs. */
export function getNetwork(opts?: pulumi.InvokeOptions): Promise<GetNetworkResult> {
  return pulumi.runtime.invoke("unraid:index:getNetwork", {}, opts);
}

export function getNetworkOutput(opts?: pulumi.InvokeOutputOptions): pulumi.Output<GetNetworkResult> {
  return pulumi.runtime.invokeOutput("unraid:index:getNetwork", {}, opts);
}
