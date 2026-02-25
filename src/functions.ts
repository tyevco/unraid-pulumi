import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, GrpcCallback, GrpcCall } from "./helpers";
import { query } from "./graphqlClient";
import { GET_SYSTEM_INFO, GET_SHARES, GET_DISKS, GET_NETWORK, GET_UPS_DEVICES, GET_PLUGINS } from "./queries/system";
import { GET_DOCKER_CONTAINERS } from "./queries/docker";
import { GET_VMS } from "./queries/vm";
import { GET_ARRAY } from "./queries/array";
import { GET_NOTIFICATIONS } from "./queries/notification";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");

type FunctionHandler = (call: GrpcCall<any, any>, callback: GrpcCallback<any>) => Promise<void>;

async function handleGetSystemInfo(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_SYSTEM_INFO);
    const info = result.info;

    const outputs = {
      hostname: info.os?.hostname || "",
      version: info.versions?.unraid || "",
      cpuModel: info.cpu?.brand || "",
      cpuCores: info.cpu?.cores || 0,
      cpuThreads: info.cpu?.threads || 0,
      memoryTotal: info.memory?.total || "",
      motherboard: `${info.baseboard?.manufacturer || ""} ${info.baseboard?.model || ""}`.trim(),
    };

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct(outputs));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get system info: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetDockerContainers(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_DOCKER_CONTAINERS);
    const containers = (result.docker?.containers || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      state: c.state,
      status: c.status,
      image: c.image,
      autoStart: c.autoStart || false,
      ports: (c.ports || []).map((p: any) => ({
        ip: p.ip || "",
        privatePort: p.privatePort || 0,
        publicPort: p.publicPort || 0,
        type: p.type || "",
      })),
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ containers }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get Docker containers: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetVirtualMachines(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_VMS);
    const vms = (result.vms?.domain || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      state: v.state,
      coreCount: v.coreCount || 0,
      threadCount: v.threadCount || 0,
      memorySize: "",
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ vms }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get VMs: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetShares(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_SHARES);
    const shares = (result.shares || []).map((s: any) => ({
      name: s.name,
      comment: s.comment || "",
      allocator: s.allocator || "",
      floor: s.floor || "",
      splitLevel: s.splitLevel || "",
      free: s.free || "",
      size: s.size || "",
      used: s.used || "",
      cachePool: s.cachePool || "",
      useCache: s.useCache || "",
      color: s.color || "",
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ shares }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get shares: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetArrayStatus(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_ARRAY);
    const array = result.array;

    const mapDisk = (d: any) => ({
      id: d.id || "",
      name: d.name || "",
      device: d.device || "",
      type: d.type || "",
      status: d.status || "",
      size: d.size || "",
      fsType: d.fsType || "",
      temp: d.temp || 0,
      numReads: d.numReads || "",
      numWrites: d.numWrites || "",
      numErrors: d.numErrors || 0,
      color: d.color || "",
    });

    const outputs = {
      state: array.state || "",
      capacity: array.capacity?.kilobytes || "",
      diskCount: array.capacity?.disks || 0,
      disks: (array.disks || []).map(mapDisk),
      parities: (array.parities || []).map(mapDisk),
      caches: (array.caches || []).map(mapDisk),
    };

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct(outputs));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get array status: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetDisks(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_DISKS);
    const disks = (result.disks || []).map((d: any) => ({
      id: d.id || "",
      name: d.name || "",
      device: d.device || "",
      type: d.type || "",
      size: d.size || "",
      status: d.smartStatus || "",
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ disks }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get disks: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetNotifications(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_NOTIFICATIONS);
    const notifications = (result.notifications?.list || []).map((n: any) => ({
      id: n.id,
      title: n.title || "",
      subject: n.subject || "",
      description: n.description || "",
      importance: n.importance || "",
      timestamp: n.timestamp || "",
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ notifications }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get notifications: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetUpsStatus(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_UPS_DEVICES);
    const devices = (result.upsDevices || []).map((d: any) => ({
      id: d.id || "",
      name: d.name || "",
      status: d.status || "",
      batteryCharge: d.battery?.charge || 0,
      batteryRuntime: d.battery?.runtime || 0,
      inputVoltage: d.power?.inputVoltage || 0,
      outputVoltage: d.power?.outputVoltage || 0,
      load: d.power?.load || 0,
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ devices }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get UPS status: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

async function handleGetNetwork(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
  try {
    const result = await query(GET_NETWORK);
    const accessUrls = (result.network?.accessUrls || []).map((u: any) => ({
      type: u.type || "",
      name: u.name || "",
      ipv4: u.ipv4 || "",
      ipv6: u.ipv6 || "",
    }));

    const response = new providerProto.InvokeResponse();
    response.setReturn(objectToStruct({ accessUrls }));
    callback(null, response);
  } catch (err: any) {
    const response = new providerProto.InvokeResponse();
    const failure = new providerProto.CheckFailure();
    failure.setReason(`Failed to get network info: ${err.message}`);
    response.addFailures(failure);
    callback(null, response);
  }
}

export const functionHandlers: Record<string, FunctionHandler> = {
  "unraid:index:getSystemInfo": handleGetSystemInfo,
  "unraid:index:getDockerContainers": handleGetDockerContainers,
  "unraid:index:getVirtualMachines": handleGetVirtualMachines,
  "unraid:index:getShares": handleGetShares,
  "unraid:index:getArrayStatus": handleGetArrayStatus,
  "unraid:index:getDisks": handleGetDisks,
  "unraid:index:getNotifications": handleGetNotifications,
  "unraid:index:getUpsStatus": handleGetUpsStatus,
  "unraid:index:getNetwork": handleGetNetwork,
};
