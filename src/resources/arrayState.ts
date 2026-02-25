import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_ARRAY, SET_ARRAY_STATE } from "../queries/array";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

function mapArrayState(apiState: string): string {
  if (apiState === "STARTED") return "START";
  if (apiState === "STOPPED") return "STOP";
  return apiState;
}

export const arrayStateResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.state) {
      failures.push(makeCheckFailure("state", "state is required"));
    }

    const validStates = ["START", "STOP"];
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

    if (olds.state !== news.state) {
      diffs.push("state");
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
      response.setId("unraid-array");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const result = await mutate(SET_ARRAY_STATE, {
        input: { desiredState: inputs.state },
      });

      const arrayData = result.array?.setState;
      const outputs = {
        state: inputs.state,
        arrayState: arrayData?.state || inputs.state,
        capacity: arrayData?.capacity || {},
      };

      const response = new providerProto.CreateResponse();
      response.setId("unraid-array");
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to set array state: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      const result = await query(GET_ARRAY);
      const array = result.array;

      const state = {
        state: mapArrayState(array.state),
        arrayState: array.state,
        capacity: array.capacity || {},
      };

      const response = new providerProto.ReadResponse();
      response.setId("unraid-array");
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({ state: mapArrayState(array.state) }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read array state: ${err.message}` });
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
      const result = await mutate(SET_ARRAY_STATE, {
        input: { desiredState: inputs.state },
      });

      const arrayData = result.array?.setState;
      const outputs = {
        state: inputs.state,
        arrayState: arrayData?.state || inputs.state,
        capacity: arrayData?.capacity || {},
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update array state: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // On deletion of ArrayState resource, stop the array
    try {
      await mutate(SET_ARRAY_STATE, {
        input: { desiredState: "STOP" },
      });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
