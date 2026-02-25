import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_CUSTOMIZATION, SET_THEME } from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const themeResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.theme) {
      failures.push(makeCheckFailure("theme", "theme is required"));
    }

    const validThemes = ["azure", "black", "gray", "white"];
    if (inputs.theme && !validThemes.includes(inputs.theme)) {
      failures.push(makeCheckFailure("theme", `Invalid theme: ${inputs.theme}. Must be one of: ${validThemes.join(", ")}`));
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

    if (olds.theme !== news.theme) {
      diffs.push("theme");
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
      response.setId("unraid-theme");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const result = await mutate(SET_THEME, { theme: inputs.theme });
      const theme = result.customization?.setTheme;

      const outputs = {
        theme: inputs.theme,
        banner: theme?.banner ?? false,
        bannerGradient: theme?.bannerGradient ?? false,
      };

      const response = new providerProto.CreateResponse();
      response.setId("unraid-theme");
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to set theme: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    try {
      const result = await query(GET_CUSTOMIZATION);
      const theme = result.customization?.theme;

      const state = {
        theme: theme?.name || "azure",
        banner: theme?.banner ?? false,
        bannerGradient: theme?.bannerGradient ?? false,
      };

      const response = new providerProto.ReadResponse();
      response.setId("unraid-theme");
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({ theme: state.theme }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read theme: ${err.message}` });
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
      const result = await mutate(SET_THEME, { theme: inputs.theme });
      const theme = result.customization?.setTheme;

      const outputs = {
        theme: inputs.theme,
        banner: theme?.banner ?? false,
        bannerGradient: theme?.bannerGradient ?? false,
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update theme: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // Reset to default theme on delete
    try {
      await mutate(SET_THEME, { theme: "azure" });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
