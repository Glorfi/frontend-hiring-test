import React, { ChangeEvent, FormEvent, useState } from 'react';
import { ItemContent, Virtuoso } from 'react-virtuoso';
import cn from 'clsx';
import {
  MessageSender,
  // MessageStatus,
  type Message,
} from '../__generated__/resolvers-types';
import css from './chat.module.css';
import { useMutation } from '@apollo/client';
import { SEND_MESSAGE, SendMessageResult, SendMessageVars } from './graphql/sendMessageMutation';

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
  const [message, setMessage] = useState<string>('');
  const [sendMessage, { data, loading, error }] = useMutation<SendMessageResult, SendMessageVars>(SEND_MESSAGE);

  function handleMessageInput(e: ChangeEvent<HTMLInputElement>) {
    setMessage(e.target.value);
  }

  async function handleSendMessageButton(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await sendMessage({ variables: { text: message } });
      console.log('Message sent');
      setMessage("")
    } catch (error) {
      console.error('❌ Eror', error);
    }
  }

  return (
    <div className={css.root}>
      <div className={css.container}>
        <Virtuoso className={css.list} data={[]} itemContent={getItem} />
      </div>
      <form className={css.footer} onSubmit={handleSendMessageButton}>
        <input
          type="text"
          className={css.textInput}
          placeholder="Message text"
          value={message}
          onChange={handleMessageInput}
        />
        <button type="submit" disabled={!message || loading}>
          {!loading ? "Send" : "Sending..."}
        </button>
      </form>
    </div>
  );
};
