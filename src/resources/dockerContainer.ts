import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import {
  GET_DOCKER_CONTAINERS,
  START_CONTAINER,
  STOP_CONTAINER,
  PAUSE_CONTAINER,
  UNPAUSE_CONTAINER,
} from "../queries/docker";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

async function findContainer(containerId: string) {
  const result = await query(GET_DOCKER_CONTAINERS);
  const containers = result.docker?.containers || [];
  return containers.find((c: any) => c.id === containerId);
}

function mapContainerState(apiState: string): string {
  switch (apiState?.toUpperCase()) {
    case "RUNNING": return "started";
    case "PAUSED": return "paused";
    case "EXITED": return "stopped";
    default: return "stopped";
  }
}

async function applyDesiredState(containerId: string, desiredState: string) {
  switch (desiredState) {
    case "started":
      return await mutate(START_CONTAINER, { id: containerId });
    case "stopped":
      return await mutate(STOP_CONTAINER, { id: containerId });
    case "paused":
      return await mutate(PAUSE_CONTAINER, { id: containerId });
    default:
      throw new Error(`Invalid desired state: ${desiredState}. Must be 'started', 'stopped', or 'paused'.`);
  }
}

export const dockerContainerResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.containerId) {
      failures.push(makeCheckFailure("containerId", "containerId is required"));
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

    if (olds.containerId !== news.containerId) {
      diffs.push("containerId");
      replaces.push("containerId");
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
      response.setId(inputs.containerId || "preview");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      await applyDesiredState(inputs.containerId, inputs.state);
      const container = await findContainer(inputs.containerId);

      const outputs = {
        containerId: inputs.containerId,
        state: inputs.state,
        name: container?.name || "",
        image: container?.image || "",
        status: container?.status || "",
      };

      const response = new providerProto.CreateResponse();
      response.setId(inputs.containerId);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to set container state: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      const container = await findContainer(id);
      if (!container) {
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const state = {
        containerId: container.id,
        state: mapContainerState(container.state),
        name: container.name,
        image: container.image,
        status: container.status,
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({
        containerId: container.id,
        state: mapContainerState(container.state),
      }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read container: ${err.message}` });
    }
  },

  async update(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());

    if (call.request.getPreview()) {
      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      await applyDesiredState(inputs.containerId, inputs.state);
      const container = await findContainer(inputs.containerId);

      const outputs = {
        containerId: inputs.containerId,
        state: inputs.state,
        name: container?.name || "",
        image: container?.image || "",
        status: container?.status || "",
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update container state: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // On delete, we stop the container to clean up
    const id = call.request.getId();
    try {
      await mutate(STOP_CONTAINER, { id });
    } catch {
      // Container may already be stopped; that's fine
    }
    callback(null, new emptyProto.Empty());
  },
};
