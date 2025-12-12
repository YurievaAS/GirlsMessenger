interface MessageInputProps {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  return (
    <footer
      style={{
        padding: 10,
        borderTop: "1px solid #333",
        display: "flex",
        gap: 8,
      }}
    >
      <input
        type="text"
        placeholder="Введите сообщение..."
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid #444",
          background: "#1f1f1f",
          color: "white",
        }}
      />
      <button
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          border: "none",
          background: "#3b82f6",
          color: "white",
          cursor: "pointer",
        }}
        onClick={onSend}
      >
        Отправить
      </button>
    </footer>
  );
}
