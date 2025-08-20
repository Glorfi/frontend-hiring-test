import { gql } from '@apollo/client';

export interface SendMessageResult {
  sendMessage: {
    id: string;
    text: string;
    sender: string;
    status: string;
    updatedAt: string;
  };
}

export interface SendMessageVars {
  text: string;
}

export const SEND_MESSAGE = gql`
  mutation SendMessage($text: String!) {
    sendMessage(text: $text) {
      text
      id
      sender
      status
      updatedAt
    }
  }
`;
