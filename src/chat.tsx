import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ItemContent, Virtuoso } from 'react-virtuoso';
import cn from 'clsx';
import {
  MessageSender,
  QueryMessagesArgs,
  // MessageStatus,
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

// const temp_data: Message[] = Array.from(Array(30), (_, index) => ({
//   id: String(index),
//   text: `Message number ${index}`,
//   status: MessageStatus.Read,
//   updatedAt: new Date().toISOString(),
//   sender: index % 2 ? MessageSender.Admin : MessageSender.Customer,
// }));

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
  const PAGE_SIZE = 10;
  const {
    data: messageQueryData,
    loading: messageQueryLoading,
    fetchMore,
  } = useQuery<MessagesResponse, QueryMessagesArgs>(GET_MESSAGES, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  });
//  const {} = useSubscription()

  const messageList: Message[] =
    messageQueryData?.messages.edges.map((edge) => edge.node) ?? [];
  const pageInfo = messageQueryData?.messages.pageInfo;

  function onReachedListEnd() {
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

  const [message, setMessage] = useState<string>('');

  const [
    sendMessage,
    {
      data: sendMessageResult,
      loading: sendMessageLoading,
      error: sendMessageError,
    },
  ] = useMutation<SendMessageResult, SendMessageVars>(SEND_MESSAGE);

  function handleMessageInput(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  async function handleSendMessageButton(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await sendMessage({ variables: { text: message } });
      console.log('Message sent');
      setMessage('');
    } catch (error) {
      console.error('❌ Eror', error);
    }
  }

  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso
          className={css.list}
          data={messageList}
          itemContent={getItem}
          endReached={onReachedListEnd}
        />
      </div>
      <form className={css.footer} onSubmit={handleSendMessageButton}>
        <input
          type="text"
          className={css.textInput}
          placeholder="Message text"
          value={message}
          onChange={handleMessageInput}
        />
        <button type="submit" disabled={!message || sendMessageLoading}>
          {!sendMessageLoading ? 'Send' : 'Sending...'}
        </button>
      </form>
    </div>
  );
};
