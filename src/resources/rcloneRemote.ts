import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_RCLONE, CREATE_RCLONE_REMOTE, DELETE_RCLONE_REMOTE } from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const rcloneRemoteResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.name) {
      failures.push(makeCheckFailure("name", "name is required"));
    }
    if (!inputs.remoteType) {
      failures.push(makeCheckFailure("remoteType", "remoteType is required"));
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

    // Name changes require replacement (RClone remotes are identified by name)
    if (olds.name !== news.name) {
      diffs.push("name");
      replaces.push("name");
    }
    if (olds.remoteType !== news.remoteType) {
      diffs.push("remoteType");
      replaces.push("remoteType");
    }
    if (JSON.stringify(olds.parameters) !== JSON.stringify(news.parameters)) {
      diffs.push("parameters");
      replaces.push("parameters");
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
      response.setId(inputs.name || "preview");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const result = await mutate(CREATE_RCLONE_REMOTE, {
        input: {
          name: inputs.name,
          type: inputs.remoteType,
          parameters: inputs.parameters || {},
        },
      });

      const remote = result.rclone.createRCloneRemote;
      const outputs = {
        name: remote.name,
        remoteType: remote.type,
        parameters: inputs.parameters || {},
      };

      const response = new providerProto.CreateResponse();
      response.setId(inputs.name);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to create RClone remote: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      const result = await query(GET_RCLONE);
      const remotes = result.rclone?.remotes || [];
      const remote = remotes.find((r: any) => r.name === id);

      if (!remote) {
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const state = {
        name: remote.name,
        remoteType: remote.type,
        parameters: {},
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct(state));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read RClone remote: ${err.message}` });
    }
  },

  async update(_call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // RClone remotes are replaced, not updated
    callback({ code: grpc.status.UNIMPLEMENTED, message: "RClone remotes are immutable; changes require replacement." });
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      await mutate(DELETE_RCLONE_REMOTE, {
        input: { name: id },
      });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
