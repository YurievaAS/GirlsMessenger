import type { Chat } from "../types/models";

interface ChatHeaderProps {
  chat: Chat | null;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  return (
    <header
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid #333",
      }}
    >
      {chat ? (
        <>
          <div style={{ fontWeight: 600 }}>{chat.title}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {chat.isGroup ? "Групповой чат" : "Личный чат"}
          </div>
        </>
      ) : (
        <div>Выберите чат</div>
      )}
    </header>
  );
}
