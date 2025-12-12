import type { Chat } from "../types/models";


interface ContactListProps {
  chats: Chat[];
  selectedChatId: number | null;
  onSelectChat: (id: number) => void;
}

export function ContactList({ chats, selectedChatId, onSelectChat }: ContactListProps) {
  return (
    <aside
      style={{
        width: 260,
        borderRight: "1px solid #333",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 12 }}>Чаты</h3>

      {chats.map(chat => (
        <div
          key={chat.id}
          onClick={() => onSelectChat(chat.id)}
          style={{
            padding: "8px 10px",
            marginBottom: 6,
            borderRadius: 6,
            cursor: "pointer",
            background: chat.id === selectedChatId ? "#252525" : "transparent",
          }}
        >
          <div style={{ fontWeight: 600 }}>{chat.title}</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {chat.isGroup ? "Групповой чат" : "Личный чат"}
          </div>
        </div>
      ))}
    </aside>
  );
}
