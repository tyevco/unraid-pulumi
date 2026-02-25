import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import {
  getStack,
  createStack,
  updateStack,
  deleteStack,
  startStack,
  stopStack,
  getDockgeConfig,
} from "../dockgeClient";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

function ensureConfigured(): void {
  if (!getDockgeConfig()) {
    throw new Error(
      "Dockge is not configured. Set dockgeUrl and dockgeApiKey via " +
      "`pulumi config set unraid:dockgeUrl <url>` and " +
      "`pulumi config set --secret unraid:dockgeApiKey <key>`"
    );
  }
}

export const dockgeStackResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.name) {
      failures.push(makeCheckFailure("name", "name is required"));
    }
    if (!inputs.composeYaml) {
      failures.push(makeCheckFailure("composeYaml", "composeYaml is required"));
    }

    // Default running to true
    if (inputs.running === undefined) {
      inputs.running = true;
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

    // Changing the stack name requires replacement
    if (olds.name !== news.name) {
      diffs.push("name");
      replaces.push("name");
    }

    // Compose YAML or env file changes are in-place updates
    if (olds.composeYaml !== news.composeYaml) {
      diffs.push("composeYaml");
    }
    if (olds.envFile !== news.envFile) {
      diffs.push("envFile");
    }
    if (olds.running !== news.running) {
      diffs.push("running");
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
      response.setProperties(objectToStruct({
        ...inputs,
        status: "preview",
        containers: [],
      }));
      callback(null, response);
      return;
    }

    try {
      ensureConfigured();

      const result = await createStack({
        name: inputs.name,
        composeYaml: inputs.composeYaml,
        envFile: inputs.envFile,
        start: inputs.running !== false,
      });

      const outputs = {
        name: inputs.name,
        composeYaml: inputs.composeYaml,
        envFile: inputs.envFile || "",
        running: inputs.running !== false,
        status: result.status || (inputs.running !== false ? "running" : "stopped"),
        containers: result.containers || [],
      };

      const response = new providerProto.CreateResponse();
      response.setId(inputs.name);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to create Dockge stack: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();
    const props = structToObject(call.request.getProperties());

    try {
      ensureConfigured();

      const stack = await getStack(id);
      if (!stack) {
        // Stack no longer exists
        const response = new providerProto.ReadResponse();
        callback(null, response);
        return;
      }

      const isRunning = stack.status === "running";
      const state = {
        name: stack.name,
        composeYaml: stack.composeYaml,
        envFile: stack.envFile || props.envFile || "",
        running: isRunning,
        status: stack.status,
        containers: stack.containers || [],
      };

      const response = new providerProto.ReadResponse();
      response.setId(id);
      response.setProperties(objectToStruct(state));
      response.setInputs(objectToStruct({
        name: stack.name,
        composeYaml: stack.composeYaml,
        envFile: stack.envFile || props.envFile || "",
        running: isRunning,
      }));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to read Dockge stack: ${err.message}` });
    }
  },

  async update(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const olds = structToObject(call.request.getOlds());
    const news = structToObject(call.request.getNews());

    if (call.request.getPreview()) {
      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct({
        ...news,
        status: olds.status || "running",
        containers: olds.containers || [],
      }));
      callback(null, response);
      return;
    }

    try {
      ensureConfigured();
      const stackName = news.name;

      // Update compose content if changed
      const composeChanged = olds.composeYaml !== news.composeYaml;
      const envChanged = olds.envFile !== news.envFile;

      if (composeChanged || envChanged) {
        await updateStack(stackName, {
          composeYaml: news.composeYaml,
          envFile: news.envFile,
        });
      }

      // Handle running state change
      const runningChanged = olds.running !== news.running;
      if (runningChanged) {
        if (news.running) {
          await startStack(stackName);
        } else {
          await stopStack(stackName);
        }
      }

      // Re-read current state
      const stack = await getStack(stackName);
      const outputs = {
        name: news.name,
        composeYaml: news.composeYaml,
        envFile: news.envFile || "",
        running: news.running,
        status: stack?.status || (news.running ? "running" : "stopped"),
        containers: stack?.containers || [],
      };

      const response = new providerProto.UpdateResponse();
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to update Dockge stack: ${err.message}` });
    }
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();

    try {
      ensureConfigured();
      await deleteStack(id);
    } catch {
      // Best effort - stack may already be gone
    }
    callback(null, new emptyProto.Empty());
  },
};
