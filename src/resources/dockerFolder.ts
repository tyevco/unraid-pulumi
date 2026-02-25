import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import {
  GET_DOCKER_ORGANIZER,
  CREATE_DOCKER_FOLDER,
  RENAME_DOCKER_FOLDER,
  DELETE_DOCKER_FOLDER,
} from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const dockerFolderResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.name) {
      failures.push(makeCheckFailure("name", "name is required"));
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

    if (olds.name !== news.name) {
      diffs.push("name");
    }
    if (olds.icon !== news.icon) {
      diffs.push("icon");
    }
    if (JSON.stringify(olds.containers) !== JSON.stringify(news.containers)) {
      diffs.push("containers");
    }

    response.setChanges(
      diffs.length > 0
        ? providerProto.DiffResponse.DiffChanges.DIFF_SOME
        : providerProto.DiffResponse.DiffChanges.DIFF_NONE
    );
    diffs.forEach((d) => response.addDiffs(d));
    callback(null, response);
  },

  async create(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getProperties());

    if (call.request.getPreview()) {
      const response = new providerProto.CreateResponse();
      response.setId("preview-folder");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const input: Record<string, any> = { name: inputs.name };
      if (inputs.icon) input.icon = inputs.icon;
      if (inputs.containers) input.containers = inputs.containers;

      const result = await mutate(CREATE_DOCKER_FOLDER, { input });
      const folder = result.docker.createDockerFolder;

      const outputs = {
        name: folder.name,
        icon: folder.icon || "",
        containers: folder.containers || [],
        expanded: folder.expanded ?? true,
      };

      const response = new providerProto.CreateResponse();
      response.setId(folder.id);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to create Docker folder: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      const result = await query(GET_DOCKER_ORGANIZER);
      const folders = result.docker?.organizer?.folders || [];
      const folder = folders.find((f: any) => f.id === id);

      if (!folder) {
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const state = {
        name: folder.name,
        icon: folder.icon || "",
        containers: folder.containers || [],
        expanded: folder.expanded ?? true,
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({
        name: state.name,
        icon: state.icon,
        containers: state.containers,
      }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to read Docker folder: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async update(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();
    const olds = structToObject(call.request.getOlds());
    const inputs = structToObject(call.request.getNews());

    if (call.request.getPreview()) {
      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      // Handle rename if name changed
      if (olds.name !== inputs.name) {
        await mutate(RENAME_DOCKER_FOLDER, {
          input: { id, name: inputs.name },
        });
      }

      // Re-read to get current state
      const result = await query(GET_DOCKER_ORGANIZER);
      const folders = result.docker?.organizer?.folders || [];
      const folder = folders.find((f: any) => f.id === id);

      const outputs = {
        name: inputs.name,
        icon: folder?.icon || inputs.icon || "",
        containers: folder?.containers || inputs.containers || [],
        expanded: folder?.expanded ?? true,
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to update Docker folder: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      await mutate(DELETE_DOCKER_FOLDER, { id });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
