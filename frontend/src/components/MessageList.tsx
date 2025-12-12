import type { Message } from "../types/models";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <div
      style={{
        flex: 1,
        padding: 10,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {messages.length === 0 ? (
        <div style={{ opacity: 0.7 }}>Сообщений пока нет</div>
      ) : (
        messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))
      )}
    </div>
  );
}
