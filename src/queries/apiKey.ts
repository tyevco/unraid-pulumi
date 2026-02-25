import { gql } from "../graphqlClient";

export const GET_API_KEYS = gql`
  query GetApiKeys {
    apiKeys {
      id
      name
      description
      roles
      permissions {
        resource
        actions
      }
    }
  }
`;

export const GET_API_KEY = gql`
  query GetApiKey($id: PrefixedID!) {
    apiKey(id: $id) {
      id
      name
      description
      roles
      permissions {
        resource
        actions
      }
    }
  }
`;

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: CreateApiKeyInput!) {
    apiKey {
      create(input: $input) {
        id
        name
        description
        roles
        permissions {
          resource
          actions
        }
        key
      }
    }
  }
`;

export const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($input: UpdateApiKeyInput!) {
    apiKey {
      update(input: $input) {
        id
        name
        description
        roles
        permissions {
          resource
          actions
        }
      }
    }
  }
`;

export const DELETE_API_KEY = gql`
  mutation DeleteApiKey($input: DeleteApiKeyInput!) {
    apiKey {
      delete(input: $input)
    }
  }
`;
