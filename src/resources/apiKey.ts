import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { query, mutate } from "../graphqlClient";
import { GET_API_KEY, GET_API_KEYS, CREATE_API_KEY, UPDATE_API_KEY, DELETE_API_KEY } from "../queries/apiKey";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const apiKeyResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.name || typeof inputs.name !== "string") {
      failures.push(makeCheckFailure("name", "name is required and must be a string"));
    }
    if (!inputs.roles || !Array.isArray(inputs.roles) || inputs.roles.length === 0) {
      failures.push(makeCheckFailure("roles", "roles is required and must be a non-empty array"));
    }

    const validRoles = ["ADMIN", "CONNECT", "GUEST", "VIEWER"];
    if (inputs.roles && Array.isArray(inputs.roles)) {
      for (const role of inputs.roles) {
        if (!validRoles.includes(role)) {
          failures.push(makeCheckFailure("roles", `Invalid role: ${role}. Must be one of: ${validRoles.join(", ")}`));
        }
      }
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
    const detailedDiff: Record<string, any> = {};
    const diffs: string[] = [];

    if (olds.name !== news.name) {
      diffs.push("name");
      const diff = new providerProto.PropertyDiff();
      diff.setKind(providerProto.PropertyDiff.Kind.UPDATE);
      detailedDiff["name"] = diff;
    }

    if (olds.description !== news.description) {
      diffs.push("description");
      const diff = new providerProto.PropertyDiff();
      diff.setKind(providerProto.PropertyDiff.Kind.UPDATE);
      detailedDiff["description"] = diff;
    }

    if (JSON.stringify(olds.roles) !== JSON.stringify(news.roles)) {
      diffs.push("roles");
      const diff = new providerProto.PropertyDiff();
      diff.setKind(providerProto.PropertyDiff.Kind.UPDATE);
      detailedDiff["roles"] = diff;
    }

    if (JSON.stringify(olds.permissions) !== JSON.stringify(news.permissions)) {
      diffs.push("permissions");
      const diff = new providerProto.PropertyDiff();
      diff.setKind(providerProto.PropertyDiff.Kind.UPDATE);
      detailedDiff["permissions"] = diff;
    }

    response.setChanges(
      diffs.length > 0
        ? providerProto.DiffResponse.DiffChanges.DIFF_SOME
        : providerProto.DiffResponse.DiffChanges.DIFF_NONE
    );
    diffs.forEach((d) => response.addDiffs(d));
    Object.entries(detailedDiff).forEach(([k, v]) => {
      response.getDetaileddiffMap().set(k, v);
    });
    response.setHasdetaileddiff(true);
    callback(null, response);
  },

  async create(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getProperties());

    if (call.request.getPreview()) {
      const response = new providerProto.CreateResponse();
      response.setId("preview-id");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const result = await mutate(CREATE_API_KEY, {
        input: {
          name: inputs.name,
          description: inputs.description || undefined,
          roles: inputs.roles,
          permissions: inputs.permissions || undefined,
        },
      });

      const apiKey = result.apiKey.create;
      const outputs = {
        name: apiKey.name,
        description: apiKey.description || "",
        roles: apiKey.roles,
        permissions: apiKey.permissions || [],
        key: apiKey.key,
      };

      const response = new providerProto.CreateResponse();
      response.setId(apiKey.id);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to create API key: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      const result = await query(GET_API_KEY, { id });
      const apiKey = result.apiKey;

      if (!apiKey) {
        // Resource no longer exists
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const state = {
        name: apiKey.name,
        description: apiKey.description || "",
        roles: apiKey.roles,
        permissions: apiKey.permissions || [],
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct(state));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read API key: ${err.message}` });
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
      const result = await mutate(UPDATE_API_KEY, {
        input: {
          id,
          name: inputs.name,
          description: inputs.description || undefined,
          roles: inputs.roles,
          permissions: inputs.permissions || undefined,
        },
      });

      const apiKey = result.apiKey.update;
      const outputs = {
        name: apiKey.name,
        description: apiKey.description || "",
        roles: apiKey.roles,
        permissions: apiKey.permissions || [],
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update API key: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      await mutate(DELETE_API_KEY, {
        input: { ids: [id] },
      });
      callback(null, new emptyProto.Empty());
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to delete API key: ${err.message}` });
    }
  },
};
