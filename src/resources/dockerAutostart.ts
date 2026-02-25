import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_DOCKER_CONTAINERS, UPDATE_AUTOSTART } from "../queries/docker";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

async function findContainer(containerId: string) {
  const result = await query(GET_DOCKER_CONTAINERS);
  const containers = result.docker?.containers || [];
  return containers.find((c: any) => c.id === containerId);
}

export const dockerAutostartResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.containerId) {
      failures.push(makeCheckFailure("containerId", "containerId is required"));
    }
    if (typeof inputs.autoStart !== "boolean") {
      failures.push(makeCheckFailure("autoStart", "autoStart is required and must be a boolean"));
    }

    if (inputs.wait === undefined) {
      inputs.wait = 0;
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
    if (olds.autoStart !== news.autoStart) {
      diffs.push("autoStart");
    }
    if (olds.wait !== news.wait) {
      diffs.push("wait");
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
      await mutate(UPDATE_AUTOSTART, {
        entries: [{
          id: inputs.containerId,
          autoStart: inputs.autoStart,
          wait: inputs.wait || 0,
        }],
      });

      const response = new providerProto.CreateResponse();
      response.setId(inputs.containerId);
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to set autostart: ${err.message}` });
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
        autoStart: container.autoStart || false,
        wait: 0, // API doesn't expose wait time in query
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct(state));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read autostart: ${err.message}` });
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
      await mutate(UPDATE_AUTOSTART, {
        entries: [{
          id: inputs.containerId,
          autoStart: inputs.autoStart,
          wait: inputs.wait || 0,
        }],
      });

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update autostart: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();
    try {
      // Disable autostart on delete
      await mutate(UPDATE_AUTOSTART, {
        entries: [{ id, autoStart: false, wait: 0 }],
      });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
