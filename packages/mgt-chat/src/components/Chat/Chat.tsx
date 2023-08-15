import React, { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import {
  ErrorBar,
  FluentThemeProvider,
  MessageThread,
  SendBox,
  MessageProps,
  MessageRenderer,
  Message,
  ChatMessage
} from '@azure/communication-react';
import { Person, PersonCardInteraction, Spinner } from '@microsoft/mgt-react';
import { FluentTheme } from '@fluentui/react';
import { FluentProvider, makeStyles, shorthands, teamsLightTheme } from '@fluentui/react-components';
import { useGraphChatClient } from '../../statefulClient/useGraphChatClient';
import ChatHeader from '../ChatHeader/ChatHeader';
import { registerAppIcons } from '../styles/registerIcons';
import { ManageChatMembers } from '../ManageChatMembers/ManageChatMembers';
import UnsupportedContent from '../UnsupportedContent/UnsupportedContent';
import { produce } from 'immer';

registerAppIcons();

interface IMgtChatProps {
  chatId: string;
}

const useStyles = makeStyles({
  chat: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    ...shorthands.overflow('auto')
  },
  chatMessages: {
    height: 'auto',
    ...shorthands.overflow('auto'),
    '& img': {
      maxWidth: '100%',
      height: 'auto'
    }
  },
  chatInput: {
    ...shorthands.overflow('unset')
  },
  fullHeight: {
    height: '100%'
  },
  unsupportedContent: {
    color: 'red'
  }
});

/**
 * A typeguard to get the ChatMessage type
 * @param msg of Message
 * @returns ChatMessage
 */
const isChatMessage = (msg: Message): msg is ChatMessage => 'content' in msg;

/**
 * Regex to detect unsupported content tags in content html.
 */
const unsupportedContentRegex = /<\/[atchmen]+>/;

export const Chat = ({ chatId }: IMgtChatProps) => {
  const styles = useStyles();
  const chatClient = useGraphChatClient(chatId);
  const [chatState, setChatState] = useState(chatClient.getState());
  useEffect(() => {
    chatClient.onStateChange(setChatState);
    return () => {
      chatClient.offStateChange(setChatState);
    };
  }, [chatClient]);

  const onRenderMessage = (messageProps: MessageProps, defaultOnRender?: MessageRenderer): JSX.Element => {
    if (isChatMessage(messageProps?.message)) {
      const content = messageProps.message?.content;

      // Test that the content is supported.
      if (unsupportedContentRegex.test(content)) {
        messageProps = produce(messageProps, (draft: ChatMessage) => {
          draft.message.content = renderToString(<UnsupportedContent />);
        });
      }
    }

    return defaultOnRender ? defaultOnRender(messageProps) : <></>;
  };

  return (
    <FluentThemeProvider fluentTheme={FluentTheme}>
      <FluentProvider theme={teamsLightTheme} className={styles.fullHeight}>
        <div className={styles.chat}>
          {chatState.userId && chatState.messages.length > 0 ? (
            <>
              <ChatHeader
                chat={chatState.chat}
                currentUserId={chatState.userId}
                onRenameChat={chatState.onRenameChat}
              />
              {chatState.participants?.length > 0 && chatState.chat?.chatType === 'group' && (
                <ManageChatMembers
                  members={chatState.participants}
                  removeChatMember={chatState.onRemoveChatMember}
                  currentUserId={chatState.userId}
                  addChatMembers={chatState.onAddChatMembers}
                />
              )}
              <div className={styles.chatMessages}>
                <MessageThread
                  userId={chatState.userId}
                  messages={chatState.messages}
                  showMessageDate={true}
                  disableEditing={chatState.disableEditing}
                  numberOfChatMessagesToReload={chatState.numberOfChatMessagesToReload}
                  onLoadPreviousChatMessages={chatState.onLoadPreviousChatMessages}
                  // TODO: Messages date rendering is behind beta flag, find out how to enable it
                  // onDisplayDateTimeString={(date: Date) => date.toISOString()}

                  // current behavior for re-send is a delete call with the clientMessageId and the a new send call
                  onDeleteMessage={chatState.onDeleteMessage}
                  onSendMessage={chatState.onSendMessage}
                  onUpdateMessage={chatState.onUpdateMessage}
                  // render props
                  onRenderAvatar={(userId?: string) => {
                    return (
                      <Person userId={userId} avatarSize="small" personCardInteraction={PersonCardInteraction.click} />
                    );
                  }}
                  onRenderMessage={onRenderMessage}
                />
              </div>
              <div className={styles.chatInput}>
                <SendBox onSendMessage={chatState.onSendMessage} />
              </div>
              <ErrorBar activeErrorMessages={chatState.activeErrorMessages} />
            </>
          ) : (
            <>
              {chatState.status}
              <Spinner />
            </>
          )}
        </div>
      </FluentProvider>
    </FluentThemeProvider>
  );
};
