import { gql } from "../graphqlClient";

export const GET_VMS = gql`
  query GetVMs {
    vms {
      domain {
        id
        name
        state
        coreCount
        threadCount
      }
    }
  }
`;

export const START_VM = gql`
  mutation StartVM($id: PrefixedID!) {
    vm {
      start(id: $id)
    }
  }
`;

export const STOP_VM = gql`
  mutation StopVM($id: PrefixedID!) {
    vm {
      stop(id: $id)
    }
  }
`;

export const FORCE_STOP_VM = gql`
  mutation ForceStopVM($id: PrefixedID!) {
    vm {
      forceStop(id: $id)
    }
  }
`;

export const PAUSE_VM = gql`
  mutation PauseVM($id: PrefixedID!) {
    vm {
      pause(id: $id)
    }
  }
`;

export const RESUME_VM = gql`
  mutation ResumeVM($id: PrefixedID!) {
    vm {
      resume(id: $id)
    }
  }
`;
