import { gql } from '@apollo/client';

export const UPDATE_MESSAGE_SUBSCRIPTION = gql(`subscription MessageUpdated {
  messageUpdated {
    id
    text
    status
    updatedAt
    sender
  }
}`);
