import { GrpcCallback, GrpcCall, getResourceType } from "./helpers";
import { apiKeyResource } from "./resources/apiKey";
import { dockerContainerResource } from "./resources/dockerContainer";
import { dockerAutostartResource } from "./resources/dockerAutostart";
import { virtualMachineResource } from "./resources/virtualMachine";
import { arrayStateResource } from "./resources/arrayState";
import { notificationResource } from "./resources/notification";
import { rcloneRemoteResource } from "./resources/rcloneRemote";
import { upsConfigResource } from "./resources/upsConfig";
import { pluginResource } from "./resources/plugin";
import { themeResource } from "./resources/theme";
import { connectSettingsResource } from "./resources/connectSettings";
import { unifiedSettingsResource } from "./resources/unifiedSettings";
import { oidcProviderResource } from "./resources/oidcProvider";
import { dockerFolderResource } from "./resources/dockerFolder";
import { dockgeStackResource } from "./resources/dockgeStack";

import * as grpc from "@grpc/grpc-js";

interface ResourceHandler {
  check: (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;
  diff: (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;
  create: (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;
  read: (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;
  update: (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;
  delete: (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;
}

const resourceHandlers: Record<string, ResourceHandler> = {
  "unraid:index:ApiKey": apiKeyResource,
  "unraid:index:DockerContainer": dockerContainerResource,
  "unraid:index:DockerAutostart": dockerAutostartResource,
  "unraid:index:VirtualMachine": virtualMachineResource,
  "unraid:index:ArrayState": arrayStateResource,
  "unraid:index:Notification": notificationResource,
  "unraid:index:RcloneRemote": rcloneRemoteResource,
  "unraid:index:UpsConfig": upsConfigResource,
  "unraid:index:Plugin": pluginResource,
  "unraid:index:Theme": themeResource,
  "unraid:index:ConnectSettings": connectSettingsResource,
  "unraid:index:UnifiedSettings": unifiedSettingsResource,
  "unraid:index:OidcProvider": oidcProviderResource,
  "unraid:index:DockerFolder": dockerFolderResource,
  "unraid:index:DockgeStack": dockgeStackResource,
};

function getHandler(call: GrpcCall<any, any>): ResourceHandler | undefined {
  const resourceType = getResourceType(call);
  return resourceHandlers[resourceType];
}

function unknownResourceError(call: GrpcCall<any, any>): grpc.ServiceError {
  const resourceType = getResourceType(call);
  return {
    code: grpc.status.UNIMPLEMENTED,
    details: `Unknown resource type: ${resourceType}`,
    message: `Unknown resource type: ${resourceType}`,
    metadata: new grpc.Metadata(),
    name: "ServiceError",
  };
}

export function dispatchCheck(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  const handler = getHandler(call);
  if (!handler) {
    callback(unknownResourceError(call));
    return;
  }
  handler.check(call, callback);
}

export function dispatchDiff(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  const handler = getHandler(call);
  if (!handler) {
    callback(unknownResourceError(call));
    return;
  }
  handler.diff(call, callback);
}

export function dispatchCreate(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  const handler = getHandler(call);
  if (!handler) {
    callback(unknownResourceError(call));
    return;
  }
  handler.create(call, callback);
}

export function dispatchRead(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  const handler = getHandler(call);
  if (!handler) {
    callback(unknownResourceError(call));
    return;
  }
  handler.read(call, callback);
}

export function dispatchUpdate(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  const handler = getHandler(call);
  if (!handler) {
    callback(unknownResourceError(call));
    return;
  }
  handler.update(call, callback);
}

export function dispatchDelete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  const handler = getHandler(call);
  if (!handler) {
    callback(unknownResourceError(call));
    return;
  }
  handler.delete(call, callback);
}
