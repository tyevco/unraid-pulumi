import { gql } from "../graphqlClient";

export const GET_DOCKER_CONTAINERS = gql`
  query GetDockerContainers {
    docker {
      containers {
        id
        name
        state
        status
        image
        autoStart
        ports {
          ip
          privatePort
          publicPort
          type
        }
      }
    }
  }
`;

export const GET_DOCKER_CONTAINER = gql`
  query GetDockerContainer {
    docker {
      containers {
        id
        name
        state
        status
        image
        autoStart
        ports {
          ip
          privatePort
          publicPort
          type
        }
      }
    }
  }
`;

export const START_CONTAINER = gql`
  mutation StartContainer($id: PrefixedID!) {
    docker {
      start(id: $id) {
        id
        name
        state
        status
        image
      }
    }
  }
`;

export const STOP_CONTAINER = gql`
  mutation StopContainer($id: PrefixedID!) {
    docker {
      stop(id: $id) {
        id
        name
        state
        status
        image
      }
    }
  }
`;

export const PAUSE_CONTAINER = gql`
  mutation PauseContainer($id: PrefixedID!) {
    docker {
      pause(id: $id) {
        id
        name
        state
        status
        image
      }
    }
  }
`;

export const UNPAUSE_CONTAINER = gql`
  mutation UnpauseContainer($id: PrefixedID!) {
    docker {
      unpause(id: $id) {
        id
        name
        state
        status
        image
      }
    }
  }
`;

export const REMOVE_CONTAINER = gql`
  mutation RemoveContainer($id: PrefixedID!, $withImage: Boolean) {
    docker {
      removeContainer(id: $id, withImage: $withImage)
    }
  }
`;

export const UPDATE_AUTOSTART = gql`
  mutation UpdateAutostart($entries: [DockerAutostartEntryInput!]!) {
    docker {
      updateAutostartConfiguration(entries: $entries)
    }
  }
`;
