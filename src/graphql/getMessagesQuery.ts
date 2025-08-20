import { gql } from '@apollo/client';
import { MessagePage } from '../../__generated__/resolvers-types';

export type MessagesResponse = {
  messages: MessagePage;
};

export const GET_MESSAGES = gql`
  query Messages($first: Int, $after: MessagesCursor, $before: MessagesCursor) {
    messages(first: $first, after: $after, before: $before) {
      edges {
        cursor
        node {
          id
          text
          sender
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
