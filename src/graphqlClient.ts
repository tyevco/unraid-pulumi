import { ApolloClient, InMemoryCache, HttpLink, gql, NormalizedCacheObject } from "@apollo/client/core";
import fetch from "cross-fetch";

export { gql };

export interface UnraidClientConfig {
  serverUrl: string;
  apiKey: string;
  verifySsl?: boolean;
}

let clientInstance: ApolloClient<NormalizedCacheObject> | null = null;
let currentConfig: UnraidClientConfig | null = null;

export function configureClient(config: UnraidClientConfig): void {
  currentConfig = config;
  clientInstance = null; // Reset so next getClient() creates a fresh one
}

export function getClient(): ApolloClient<NormalizedCacheObject> {
  if (!currentConfig) {
    throw new Error("Unraid provider not configured. Set serverUrl and apiKey.");
  }

  if (clientInstance) {
    return clientInstance;
  }

  const graphqlUrl = currentConfig.serverUrl.replace(/\/+$/, "") + "/graphql";

  clientInstance = new ApolloClient({
    link: new HttpLink({
      uri: graphqlUrl,
      fetch,
      headers: {
        "x-api-key": currentConfig.apiKey,
        "Content-Type": "application/json",
      },
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: "no-cache" },
      mutate: { fetchPolicy: "no-cache" },
    },
  });

  return clientInstance;
}

export async function query<T = any>(
  queryDoc: ReturnType<typeof gql>,
  variables?: Record<string, any>
): Promise<T> {
  const client = getClient();
  const result = await client.query<T>({ query: queryDoc, variables });
  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL query error: ${result.errors.map(e => e.message).join(", ")}`);
  }
  return result.data;
}

export async function mutate<T = any>(
  mutationDoc: ReturnType<typeof gql>,
  variables?: Record<string, any>
): Promise<T> {
  const client = getClient();
  const result = await client.mutate<T>({ mutation: mutationDoc, variables });
  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL mutation error: ${result.errors.map(e => e.message).join(", ")}`);
  }
  return result.data as T;
}
