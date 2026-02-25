import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import {
  GET_OIDC_PROVIDER,
  GET_OIDC_CONFIGURATION,
  CREATE_OIDC_PROVIDER,
  UPDATE_OIDC_PROVIDER,
  DELETE_OIDC_PROVIDER,
} from "../queries/system";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

function extractOidcOutputs(provider: any, inputs: any): Record<string, any> {
  return {
    name: provider.name || inputs.name,
    issuerUrl: provider.issuerUrl || inputs.issuerUrl,
    clientId: provider.clientId || inputs.clientId,
    clientSecret: provider.clientSecret || inputs.clientSecret || "",
    scopes: provider.scopes || inputs.scopes || [],
    groupClaim: provider.groupClaim || "",
    adminGroup: provider.adminGroup || "",
    allowedGroups: provider.allowedGroups || [],
    autoLogin: provider.autoLogin ?? false,
    showOnLoginPage: provider.showOnLoginPage ?? true,
    buttonLabel: provider.buttonLabel || "",
    buttonColor: provider.buttonColor || "",
    buttonTextColor: provider.buttonTextColor || "",
    buttonIcon: provider.buttonIcon || "",
  };
}

export const oidcProviderResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.name) {
      failures.push(makeCheckFailure("name", "name is required"));
    }
    if (!inputs.issuerUrl) {
      failures.push(makeCheckFailure("issuerUrl", "issuerUrl is required"));
    }
    if (!inputs.clientId) {
      failures.push(makeCheckFailure("clientId", "clientId is required"));
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

    const fields = [
      "name", "issuerUrl", "clientId", "clientSecret", "scopes",
      "groupClaim", "adminGroup", "allowedGroups", "autoLogin",
      "showOnLoginPage", "buttonLabel", "buttonColor", "buttonTextColor", "buttonIcon",
    ];

    for (const field of fields) {
      const oldVal = JSON.stringify(olds[field]);
      const newVal = JSON.stringify(news[field]);
      if (oldVal !== newVal && news[field] !== undefined) {
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
      response.setId("preview-oidc");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const input: Record<string, any> = {
        name: inputs.name,
        issuerUrl: inputs.issuerUrl,
        clientId: inputs.clientId,
      };
      if (inputs.clientSecret) input.clientSecret = inputs.clientSecret;
      if (inputs.scopes) input.scopes = inputs.scopes;
      if (inputs.groupClaim) input.groupClaim = inputs.groupClaim;
      if (inputs.adminGroup) input.adminGroup = inputs.adminGroup;
      if (inputs.allowedGroups) input.allowedGroups = inputs.allowedGroups;
      if (inputs.autoLogin !== undefined) input.autoLogin = inputs.autoLogin;
      if (inputs.showOnLoginPage !== undefined) input.showOnLoginPage = inputs.showOnLoginPage;
      if (inputs.buttonLabel) input.buttonLabel = inputs.buttonLabel;
      if (inputs.buttonColor) input.buttonColor = inputs.buttonColor;
      if (inputs.buttonTextColor) input.buttonTextColor = inputs.buttonTextColor;
      if (inputs.buttonIcon) input.buttonIcon = inputs.buttonIcon;

      const result = await mutate(CREATE_OIDC_PROVIDER, { input });
      const provider = result.createOidcProvider;

      const response = new providerProto.CreateResponse();
      response.setId(provider.id);
      response.setProperties(objectToStruct(extractOidcOutputs(provider, inputs)));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to create OIDC provider: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      const result = await query(GET_OIDC_PROVIDER, { id });
      const provider = result.oidcProvider;

      if (!provider) {
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const state = extractOidcOutputs(provider, {});
      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({
        name: state.name,
        issuerUrl: state.issuerUrl,
        clientId: state.clientId,
        clientSecret: state.clientSecret,
      }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to read OIDC provider: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async update(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();
    const inputs = structToObject(call.request.getNews());

    if (call.request.getPreview()) {
      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const input: Record<string, any> = { id };
      const fields = [
        "name", "issuerUrl", "clientId", "clientSecret", "scopes",
        "groupClaim", "adminGroup", "allowedGroups", "autoLogin",
        "showOnLoginPage", "buttonLabel", "buttonColor", "buttonTextColor", "buttonIcon",
      ];
      for (const field of fields) {
        if (inputs[field] !== undefined) input[field] = inputs[field];
      }

      const result = await mutate(UPDATE_OIDC_PROVIDER, { input });
      const provider = result.updateOidcProvider;

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(extractOidcOutputs(provider, inputs)));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, details: `Failed to update OIDC provider: ${err.message}`, message: err.message, metadata: new grpc.Metadata(), name: "ServiceError" });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      await mutate(DELETE_OIDC_PROVIDER, { id });
    } catch {
      // Best effort
    }
    callback(null, new emptyProto.Empty());
  },
};
