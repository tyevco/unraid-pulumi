import * as grpc from "@grpc/grpc-js";
import { structToObject, objectToStruct, makeCheckFailure, GrpcCallback, GrpcCall } from "../helpers";
import { mutate } from "../graphqlClient";
import { CREATE_NOTIFICATION, DELETE_NOTIFICATION } from "../queries/notification";

const providerProto = require("@pulumi/pulumi/proto/provider_pb");
const emptyProto = require("google-protobuf/google/protobuf/empty_pb");

export const notificationResource = {
  async check(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const inputs = structToObject(call.request.getNews());
    const failures: any[] = [];

    if (!inputs.title) {
      failures.push(makeCheckFailure("title", "title is required"));
    }
    if (!inputs.subject) {
      failures.push(makeCheckFailure("subject", "subject is required"));
    }
    if (!inputs.message) {
      failures.push(makeCheckFailure("message", "message is required"));
    }
    if (!inputs.importance) {
      failures.push(makeCheckFailure("importance", "importance is required"));
    }

    const validImportance = ["ALERT", "WARNING", "INFO"];
    if (inputs.importance && !validImportance.includes(inputs.importance)) {
      failures.push(makeCheckFailure("importance", `Invalid importance: ${inputs.importance}. Must be one of: ${validImportance.join(", ")}`));
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

    // Notifications are immutable - any change requires replacement
    for (const key of ["title", "subject", "message", "importance", "link"]) {
      if (olds[key] !== news[key]) {
        diffs.push(key);
        replaces.push(key);
      }
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
      response.setId("preview-notification");
      response.setProperties(objectToStruct(inputs));
      callback(null, response);
      return;
    }

    try {
      const result = await mutate(CREATE_NOTIFICATION, {
        input: {
          title: inputs.title,
          subject: inputs.subject,
          description: inputs.message,
          importance: inputs.importance,
          link: inputs.link || undefined,
        },
      });

      const notification = result.createNotification;
      const outputs = {
        title: notification.title,
        subject: notification.subject,
        message: notification.description,
        importance: notification.importance,
        link: notification.link || "",
        timestamp: notification.timestamp || "",
        notificationType: notification.type || "UNREAD",
      };

      const response = new providerProto.CreateResponse();
      response.setId(notification.id);
      response.setProperties(objectToStruct(outputs));
      callback(null, response);
    } catch (err: any) {
      callback({ code: grpc.status.INTERNAL, message: `Failed to create notification: ${err.message}` });
    }
  },

  async read(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // Notifications don't have a direct get-by-id query in the schema,
    // so we return the stored state as-is
    const props = structToObject(call.request.getProperties());
    const response = new providerProto.ReadResponse();
    response.setId(call.request.getId());
    response.setProperties(objectToStruct(props));
    response.setInputs(objectToStruct(props));
    callback(null, response);
  },

  async update(_call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    // Notifications are immutable - diff should always return replaces
    callback({ code: grpc.status.UNIMPLEMENTED, message: "Notifications are immutable; changes require replacement." });
  },

  async delete(call: GrpcCall<any, any>, callback: GrpcCallback<any>) {
    const id = call.request.getId();
    const props = structToObject(call.request.getProperties());

    try {
      await mutate(DELETE_NOTIFICATION, {
        id,
        type: props.notificationType || "UNREAD",
      });
    } catch {
      // Best effort - notification may already be deleted
    }
    callback(null, new emptyProto.Empty());
  },
};
