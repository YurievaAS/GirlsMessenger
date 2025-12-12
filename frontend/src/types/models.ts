export interface User {
  id: number;
  username: string;
  status: "online" | "offline";
  avatarUrl?: string;
  phone?: string;
  about?: string;
  handle?: string;
}

export type MessageStatus = "delivered" | "read";

export interface Message {
  id: number;
  chatId: number;
  senderId: number;

  text?: string;
  encryptedText?: string;

  status?: MessageStatus;
  createdAt: string;
}

export interface Chat {
  id: number;
  title: string;
  isGroup: boolean;
  participantIds: number[];
  avatarUrl?: string;
  lastMessage?: Message;
}
