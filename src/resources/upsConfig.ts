import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_UPS_CONFIGURATION, CONFIGURE_UPS } from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const upsConfigResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.service) {
      failures.push(makeCheckFailure("service", "service is required (ENABLE or DISABLE)"));
    }
    const validServices = ["ENABLE", "DISABLE"];
    if (inputs.service && !validServices.includes(inputs.service)) {
      failures.push(makeCheckFailure("service", `Invalid service: ${inputs.service}. Must be ENABLE or DISABLE.`));
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

    const fields = ["service", "upsCable", "customUpsCable", "upsType", "device",
                    "batteryLevel", "minutes", "timeout", "killUps"];
    for (const field of fields) {
      if (olds[field] !== news[field] && news[field] !== undefined) {
        diffs.push(field);
      }
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
      response.setId("unraid-ups");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const config: Record<string, any> = { service: inputs.service };
      if (inputs.upsCable) config.upsCable = inputs.upsCable;
      if (inputs.customUpsCable) config.customUpsCable = inputs.customUpsCable;
      if (inputs.upsType) config.upsType = inputs.upsType;
      if (inputs.device) config.device = inputs.device;
      if (inputs.batteryLevel !== undefined) config.batteryLevel = inputs.batteryLevel;
      if (inputs.minutes !== undefined) config.minutes = inputs.minutes;
      if (inputs.timeout !== undefined) config.timeout = inputs.timeout;
      if (inputs.killUps) config.killUps = inputs.killUps;

      await mutate(CONFIGURE_UPS, { config });

      const response = new providerProto.CreateResponse();
      response.setId("unraid-ups");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to configure UPS: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      const result = await query(GET_UPS_CONFIGURATION);
      const config = result.upsConfiguration;

      const state: Record<string, any> = {
        service: config.service,
      };
      if (config.upsCable) state.upsCable = config.upsCable;
      if (config.customUpsCable) state.customUpsCable = config.customUpsCable;
      if (config.upsType) state.upsType = config.upsType;
      if (config.device) state.device = config.device;
      if (config.batteryLevel !== undefined) state.batteryLevel = config.batteryLevel;
      if (config.minutes !== undefined) state.minutes = config.minutes;
      if (config.timeout !== undefined) state.timeout = config.timeout;
      if (config.killUps) state.killUps = config.killUps;

      const response = new providerProto.ReadResponse();
      response.setId("unraid-ups");
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct(state));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read UPS config: ${err.message}` });
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
      const config: Record<string, any> = { service: inputs.service };
      if (inputs.upsCable) config.upsCable = inputs.upsCable;
      if (inputs.customUpsCable) config.customUpsCable = inputs.customUpsCable;
      if (inputs.upsType) config.upsType = inputs.upsType;
      if (inputs.device) config.device = inputs.device;
      if (inputs.batteryLevel !== undefined) config.batteryLevel = inputs.batteryLevel;
      if (inputs.minutes !== undefined) config.minutes = inputs.minutes;
      if (inputs.timeout !== undefined) config.timeout = inputs.timeout;
      if (inputs.killUps) config.killUps = inputs.killUps;

      await mutate(CONFIGURE_UPS, { config });

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update UPS config: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      await mutate(CONFIGURE_UPS, { config: { service: "DISABLE" } });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
