import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_SETTINGS, UPDATE_SETTINGS } from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const unifiedSettingsResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.values || typeof inputs.values !== "object") {
      const failure = new providerProto.CheckFailure();
      failure.setProperty("values");
      failure.setReason("values is required and must be an object containing the settings to apply");
      failures.push(failure);
    }

    const response = new providerProto.CheckResponse();
    response.setInputs(objectToStruct(inputs));
    failures.forEach((f: any) => response.addFailures(f));
    callback(null, response);
  },

  async diff(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const olds = structToObject(call.request.getOlds());
    const news = structToObject(call.request.getNews());
    const response = new providerProto.DiffResponse();
    const diffs: string[] = [];

    if (JSON.stringify(olds.values) !== JSON.stringify(news.values)) {
      diffs.push("values");
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
      response.setId("unraid-settings");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const result = await mutate(UPDATE_SETTINGS, { input: inputs.values });
      const outputs = {
        values: result.updateSettings.values || inputs.values,
        restartRequired: result.updateSettings.restartRequired || false,
        warnings: result.updateSettings.warnings || [],
      };

      const response = new providerProto.CreateResponse();
      response.setId("unraid-settings");
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to update settings: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      const result = await query(GET_SETTINGS);
      const unified = result.settings?.unified;

      const state = {
        values: unified?.values || {},
        dataSchema: unified?.dataSchema || {},
        uiSchema: unified?.uiSchema || {},
        restartRequired: false,
        warnings: [],
      };

      const response = new providerProto.ReadResponse();
      response.setId("unraid-settings");
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({ values: state.values }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to read settings: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
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
      const result = await mutate(UPDATE_SETTINGS, { input: inputs.values });
      const outputs = {
        values: result.updateSettings.values || inputs.values,
        restartRequired: result.updateSettings.restartRequired || false,
        warnings: result.updateSettings.warnings || [],
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to update settings: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async delete(_call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // Settings can't be "deleted" - they always exist on the server.
    // On resource removal, we just stop managing them.
    callback(null, new emptyProto.Empty());
  },
};
