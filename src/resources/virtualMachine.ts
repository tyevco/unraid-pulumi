import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_VMS, START_VM, STOP_VM, PAUSE_VM, RESUME_VM, FORCE_STOP_VM } from "../queries/vm";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

async function findVm(vmId: string) {
  const result = await query(GET_VMS);
  const domains = result.vms?.domain || [];
  return domains.find((d: any) => d.id === vmId);
}

function mapVmState(apiState: string): string {
  switch (apiState?.toUpperCase()) {
    case "RUNNING":
    case "IDLE":
      return "started";
    case "PAUSED":
    case "PMSUSPENDED":
      return "paused";
    case "SHUTOFF":
    case "SHUTDOWN":
    case "CRASHED":
    case "NOSTATE":
      return "stopped";
    default:
      return "stopped";
  }
}

async function applyDesiredState(vmId: string, desiredState: string, currentState?: string) {
  switch (desiredState) {
    case "started":
      if (currentState === "paused") {
        return await mutate(RESUME_VM, { id: vmId });
      }
      return await mutate(START_VM, { id: vmId });
    case "stopped":
      return await mutate(STOP_VM, { id: vmId });
    case "paused":
      return await mutate(PAUSE_VM, { id: vmId });
    default:
      throw new Error(`Invalid desired state: ${desiredState}. Must be 'started', 'stopped', or 'paused'.`);
  }
}

export const virtualMachineResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.vmId) {
      failures.push(makeCheckFailure("vmId", "vmId is required"));
    }
    if (!inputs.state) {
      failures.push(makeCheckFailure("state", "state is required"));
    }

    const validStates = ["started", "stopped", "paused"];
    if (inputs.state && !validStates.includes(inputs.state)) {
      failures.push(makeCheckFailure("state", `Invalid state: ${inputs.state}. Must be one of: ${validStates.join(", ")}`));
    }

    const response = new providerProto.CheckResponse();
    response.setInputs(objectToStruct(inputs));
    failures.forEach((f) => response.addFailures(f));
    callback(null, response);
  },

  async diff(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const olds = structToObject(call.request.getOlds());
    const news = structToObject(call.request.getNews());
    const response = new providerProto.DiffResponse();
    const diffs: string[] = [];
    const replaces: string[] = [];

    if (olds.vmId !== news.vmId) {
      diffs.push("vmId");
      replaces.push("vmId");
    }
    if (olds.state !== news.state) {
      diffs.push("state");
    }

    response.setChanges(
      diffs.length > 0
        ? providerProto.DiffResponse.DiffChanges.DIFF_SOME
        : providerProto.DiffResponse.DiffChanges.DIFF_NONE
    );
    diffs.forEach((d) => response.addDiffs(d));
    replaces.forEach((r) => response.addReplaces(r));
    response.setDeletebeforereplace(true);
    callback(null, response);
  },

  async create(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getProperties());

    if (call.request.getPreview()) {
      const response = new providerProto.CreateResponse();
      response.setId(inputs.vmId || "preview");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      await applyDesiredState(inputs.vmId, inputs.state);
      const vm = await findVm(inputs.vmId);

      const outputs = {
        vmId: inputs.vmId,
        state: inputs.state,
        name: vm?.name || "",
        coreCount: vm?.coreCount || 0,
        threadCount: vm?.threadCount || 0,
      };

      const response = new providerProto.CreateResponse();
      response.setId(inputs.vmId);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to set VM state: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      const vm = await findVm(id);
      if (!vm) {
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const state = {
        vmId: vm.id,
        state: mapVmState(vm.state),
        name: vm.name,
        coreCount: vm.coreCount || 0,
        threadCount: vm.threadCount || 0,
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({
        vmId: vm.id,
        state: mapVmState(vm.state),
      }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read VM: ${err.message}` });
    }
  },

  async update(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const olds = structToObject(call.request.getOlds());
    const inputs = structToObject(call.request.getNews());

    if (call.request.getPreview()) {
      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      await applyDesiredState(inputs.vmId, inputs.state, olds.state);
      const vm = await findVm(inputs.vmId);

      const outputs = {
        vmId: inputs.vmId,
        state: inputs.state,
        name: vm?.name || "",
        coreCount: vm?.coreCount || 0,
        threadCount: vm?.threadCount || 0,
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update VM state: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();
    try {
      await mutate(STOP_VM, { id });
    } catch {
      // VM may already be stopped
    }
    callback(null, new emptyProto.Empty());
  },
};
