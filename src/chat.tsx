import React, { ChangeEvent, FormEvent, useState } from 'react';
import { ItemContent, Virtuoso } from 'react-virtuoso';
import cn from 'clsx';
import {
  MessageSender,
  QueryMessagesArgs,
  type Message,
} from '../__generated__/resolvers-types';
import css from './chat.module.css';
import { useMutation, useQuery, useSubscription } from '@apollo/client';
import {
  SEND_MESSAGE,
  SendMessageResult,
  SendMessageVars,
} from './graphql/sendMessageMutation';
import { GET_MESSAGES, MessagesResponse } from './graphql/getMessagesQuery';
import { ADD_MESSAGE_SUBSCRIPTION } from './graphql/messageAddedSubscirption';

const Item: React.FC<Message> = ({ text, sender }) => {
  return (
    <div className={css.item}>
      <div
        className={cn(
          css.message,
          sender === MessageSender.Admin ? css.out : css.in
        )}
      >
        {text}
      </div>
    </div>
  );
};

const getItem: ItemContent<Message, unknown> = (_, data) => {
  return <Item {...data} />;
};

export const Chat: React.FC = () => {
  const [messageList, setMessageList] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const PAGE_SIZE = 10;

  const { data: messageQueryData, fetchMore } = useQuery<
    MessagesResponse,
    QueryMessagesArgs
  >(GET_MESSAGES, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setMessageList(data.messages.edges.map((edge) => edge.node));
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  function onReachedListEnd() {
    const pageInfo = messageQueryData?.messages.pageInfo;
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      fetchMore({
        variables: { first: PAGE_SIZE, after: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            messages: {
              ...fetchMoreResult.messages,
              edges: [
                ...prev.messages.edges,
                ...fetchMoreResult.messages.edges,
              ],
              pageInfo: fetchMoreResult.messages.pageInfo,
            },
          };
        },
      });
    }
  }

  const [sendMessage, { loading: sendMessageLoading }] = useMutation<
    SendMessageResult,
    SendMessageVars
  >(SEND_MESSAGE);

  function handleMessageInput(e: ChangeEvent<HTMLInputElement>) {
    setNewMessage(e.target.value);
  }

  async function handleSendMessageButton(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await sendMessage({ variables: { text: newMessage } });
      console.log('Message sent');
      setNewMessage('');
    } catch (error) {
      console.error('❌ Eror', error);
      setErrorMessage('Smth went wrong, check the logs to find out');
    }
  }

  useSubscription(ADD_MESSAGE_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      if (!subscriptionData.data) return;
      const newMessage = subscriptionData.data.messageAdded;
      setMessageList((prev) => [...prev, newMessage]);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso
          className={css.list}
          data={messageList}
          itemContent={getItem}
          endReached={onReachedListEnd}
          followOutput="smooth"
        />
      </div>
      <form className={css.footer} onSubmit={handleSendMessageButton}>
        <input
          type="text"
          className={css.textInput}
          placeholder="Message text"
          value={newMessage}
          onChange={handleMessageInput}
        />
        <button type="submit" disabled={!newMessage || sendMessageLoading}>
          {!sendMessageLoading ? 'Send' : 'Sending...'}
        </button>
      </form>
      {errorMessage && <p className={css.p}>{errorMessage}</p>}
    </div>
  );
};
