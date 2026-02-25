import { gql } from "../graphqlClient";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      list {
        id
        title
        subject
        description
        importance
        link
        timestamp
        type
      }
    }
  }
`;

export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($input: NotificationData!) {
    createNotification(input: $input) {
      id
      title
      subject
      description
      importance
      link
      timestamp
      type
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: PrefixedID!, $type: NotificationType!) {
    deleteNotification(id: $id, type: $type) {
      unread
      archive
    }
  }
`;

export const ARCHIVE_NOTIFICATION = gql`
  mutation ArchiveNotification($id: PrefixedID!) {
    archiveNotification(id: $id) {
      id
      title
      subject
      description
      importance
      type
    }
  }
`;
