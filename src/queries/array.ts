import { gql } from "../graphqlClient";

export const GET_ARRAY = gql`
  query GetArray {
    array {
      state
      capacity {
        kilobytes
        disks
      }
      disks {
        id
        name
        device
        type
        status
        size
        fsType
        temp
        numReads
        numWrites
        numErrors
        color
      }
      parities {
        id
        name
        device
        type
        status
        size
        temp
        numReads
        numWrites
        numErrors
        color
      }
      caches {
        id
        name
        device
        type
        status
        size
        fsType
        temp
        numReads
        numWrites
        numErrors
        color
      }
    }
  }
`;

export const SET_ARRAY_STATE = gql`
  mutation SetArrayState($input: ArrayStateInput!) {
    array {
      setState(input: $input) {
        state
        capacity {
          kilobytes
          disks
        }
      }
    }
  }
`;
