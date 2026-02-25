import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { mutate } from "../graphqlClient";
import { ADD_PLUGIN, REMOVE_PLUGIN } from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const pluginResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.name) {
      failures.push(makeCheckFailure("name", "name is required (plugin name or URL)"));
    }

    if (inputs.restart === undefined) {
      inputs.restart = false;
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

    if (olds.name !== news.name) {
      diffs.push("name");
      replaces.push("name");
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
      await mutate(ADD_PLUGIN, {
        input: {
          names: [inputs.name],
          restart: inputs.restart || false,
        },
      });

      const response = new providerProto.CreateResponse();
      response.setId(inputs.name);
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to add plugin: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const props = structToObject(call.request.getProperties());
    const response = new providerProto.ReadResponse();
    response.setId(call.request.getId());
    response.setProperties(objectToStruct(props));
    response.setInputs(objectToStruct(props));
    callback(null, response);
  },

  async update(_call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    callback({ code: grpc.status.UNIMPLEMENTED, message: "Plugins are replaced, not updated." });
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const props = structToObject(call.request.getProperties());

    try {
      await mutate(REMOVE_PLUGIN, {
        input: {
          names: [props.name || call.request.getId()],
          restart: false,
        },
      });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
