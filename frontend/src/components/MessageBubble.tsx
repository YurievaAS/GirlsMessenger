import type { Message } from "../types/models";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      style={{
        alignSelf: isOwn ? "flex-end" : "flex-start",
        maxWidth: "70%",
        background: isOwn ? "#3b82f6" : "#333",
        padding: "6px 10px",
        borderRadius: 10,
        fontSize: 14,
      }}
    >
      <div>{message.text}</div>
      <div
        style={{
          fontSize: 10,
          opacity: 0.7,
          textAlign: "right",
          marginTop: 2,
        }}
      >
        {new Date(message.createdAt).toLocaleTimeString().slice(0, 5)}
      </div>
    </div>
  );
}
