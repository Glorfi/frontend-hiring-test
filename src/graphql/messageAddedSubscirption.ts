import { gql } from '@apollo/client';

export const ADD_MESSAGE_SUBSCRIPTION = gql(`subscription MessageAdded {
  messageAdded {
    id
    text
    status
    updatedAt
    sender
  }
}`);
