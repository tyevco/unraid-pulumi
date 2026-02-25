import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_CONNECT, UPDATE_CONNECT_SETTINGS } from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const connectSettingsResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.accessType) {
      failures.push(makeCheckFailure("accessType", "accessType is required (DYNAMIC, ALWAYS, or DISABLED)"));
    }

    const validAccessTypes = ["DYNAMIC", "ALWAYS", "DISABLED"];
    if (inputs.accessType && !validAccessTypes.includes(inputs.accessType)) {
      failures.push(makeCheckFailure("accessType", `Invalid accessType: ${inputs.accessType}. Must be one of: ${validAccessTypes.join(", ")}`));
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

    if (olds.accessType !== news.accessType) diffs.push("accessType");
    if (olds.forwardType !== news.forwardType) diffs.push("forwardType");
    if (olds.port !== news.port) diffs.push("port");

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
      response.setId("unraid-connect");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const input: Record<string, any> = { accessType: inputs.accessType };
      if (inputs.forwardType) input.forwardType = inputs.forwardType;
      if (inputs.port !== undefined) input.port = inputs.port;

      const result = await mutate(UPDATE_CONNECT_SETTINGS, { input });
      const settings = result.updateApiSettings;

      const outputs = {
        accessType: settings.accessType || inputs.accessType,
        forwardType: settings.forwardType || inputs.forwardType,
        port: settings.port || inputs.port,
      };

      const response = new providerProto.CreateResponse();
      response.setId("unraid-connect");
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update connect settings: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      const result = await query(GET_CONNECT);
      const connect = result.connect;

      const state = {
        accessType: connect.accessType || "DISABLED",
        forwardType: connect.forwardType,
        port: connect.port,
      };

      const response = new providerProto.ReadResponse();
      response.setId("unraid-connect");
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct(state));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read connect settings: ${err.message}` });
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
      const input: Record<string, any> = { accessType: inputs.accessType };
      if (inputs.forwardType) input.forwardType = inputs.forwardType;
      if (inputs.port !== undefined) input.port = inputs.port;

      const result = await mutate(UPDATE_CONNECT_SETTINGS, { input });
      const settings = result.updateApiSettings;

      const outputs = {
        accessType: settings.accessType || inputs.accessType,
        forwardType: settings.forwardType || inputs.forwardType,
        port: settings.port || inputs.port,
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update connect settings: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      await mutate(UPDATE_CONNECT_SETTINGS, {
        input: { accessType: "DISABLED" },
      });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
