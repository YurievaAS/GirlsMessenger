import { useEffect, useRef, useState } from "react";
import type { Chat, Message, User } from "../types/models";

const initialUsers: User[] = [
  {
    id: 1,
    username: "Вика",
    status: "online",
    phone: "+7 900 000 00 01",
    about: "Делаю учебный мессенджер 💗",
    handle: "vika",
  },
  {
    id: 2,
    username: "Арина",
    status: "offline",
    phone: "+7 900 000 00 02",
    about: "Fullstack, люблю порядок в коде.",
    handle: "arina",
  },
];

const initialMessages: Message[] = [
  {
    id: 1,
    chatId: 1,
    senderId: 1,
    text: "Привет!",
    createdAt: new Date().toISOString(),
    status: "read",
  },
  {
    id: 2,
    chatId: 1,
    senderId: 2,
    text: "Привет, как дела с мессенджером?",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    chatId: 1,
    senderId: 1,
    text: "Живу в VS Code теперь.",
    createdAt: new Date().toISOString(),
    status: "read",
  },
];

function buildInitialChats(messages: Message[]): Chat[] {
  const baseChats: Chat[] = [
    {
      id: 1,
      title: "Личный чат с Ариной",
      isGroup: false,
      participantIds: [1, 2],
    },
    {
      id: 2,
      title: "Групповой чат проекта",
      isGroup: true,
      participantIds: [1, 2],
    },
  ];

  return baseChats.map((chat) => {
    const msgs = messages.filter((m) => m.chatId === chat.id);
    const lastMessage =
      msgs.length > 0
        ? msgs.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
        : undefined;

    return { ...chat, lastMessage };
  });
}

const MESSAGE_KEY = "demo-secret-key";

function encryptLocal(text: string): string {
  const key = MESSAGE_KEY;
  let res = "";
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    res += String.fromCharCode(c);
  }
  return btoa(res);
}

function decryptLocal(encrypted: string): string {
  try {
    const key = MESSAGE_KEY;
    const decoded = atob(encrypted);
    let res = "";
    for (let i = 0; i < decoded.length; i++) {
      const c = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      res += String.fromCharCode(c);
    }
    return res;
  } catch {
    return "[decrypt error]";
  }
}

export function MessengerPage() {
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chats, setChats] = useState<Chat[]>(() =>
    buildInitialChats(initialMessages)
  );

  const [selectedChatId, setSelectedChatId] = useState<number>(1);
  const [messageText, setMessageText] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileDraft, setProfileDraft] = useState<User | null>(null);
  const [profileEditMode, setProfileEditMode] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const lastNotifiedMessageIdRef = useRef<number | null>(null);
  const previousTitleRef = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null;
  const chatMessages = messages.filter((m) => m.chatId === selectedChatId);

  const directChatUser =
    selectedChat && !selectedChat.isGroup
      ? users.find((u) => u.id !== currentUser.id)
      : null;

  const displayProfile: User | null =
    profileEditMode && profileDraft ? profileDraft : profileUser;

  const isOwnProfile =
    profileUser && currentUser && profileUser.id === currentUser.id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().then((result) => {
        setNotificationsEnabled(result === "granted");
      });
    }
  }, []);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;
    if (messages.length === 0) return;

    const last = messages[messages.length - 1];

    if (lastNotifiedMessageIdRef.current === last.id) return;
    lastNotifiedMessageIdRef.current = last.id;

    if (last.senderId === currentUser.id) return;

    if (
      selectedChatId === last.chatId &&
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
    ) {
      return;
    }

    const sender = users.find((u) => u.id === last.senderId);
    const plainText = last.encryptedText
      ? decryptLocal(last.encryptedText)
      : last.text ?? "";
    const bodyText = sender ? `${sender.username}: ${plainText}` : plainText;

    if (Notification.permission === "granted") {
      try {
        new Notification("Новое сообщение", {
          body: bodyText,
          tag: `chat-${last.chatId}`,
        });
      } catch {}
    }
    if (typeof document !== "undefined") {
      if (!previousTitleRef.current) {
        previousTitleRef.current = document.title;
      }
      document.title = "💬 Новое сообщение";

      const timeoutId = window.setTimeout(() => {
        if (previousTitleRef.current) {
          document.title = previousTitleRef.current;
          previousTitleRef.current = null;
        }
      }, 3000);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [messages, notificationsEnabled, currentUser.id, selectedChatId, users]);

  function handleMessageInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    setMessageText(el.value);

    el.style.height = "0px";
    const maxHeight = 140;
    const newHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${newHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }

  function handleMessageKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    if (!messageText.trim()) return;

    const cipher = encryptLocal(messageText.trim());

    const msg: Message = {
      id: Date.now(),
      chatId: selectedChatId,
      senderId: currentUser.id,
      encryptedText: cipher,
      createdAt: new Date().toISOString(),
      status: "delivered",
    };

    setMessages((prev) => [...prev, msg]);

    setChats((prev) => {
      const updated = prev.map((c) =>
        c.id === selectedChatId ? { ...c, lastMessage: msg } : c
      );
      return [...updated].sort(
        (a, b) =>
          new Date(b.lastMessage?.createdAt ?? 0).getTime() -
          new Date(a.lastMessage?.createdAt ?? 0).getTime()
      );
    });

    setMessageText("");

    if (messageInputRef.current) {
      messageInputRef.current.style.height = "40px";
      messageInputRef.current.style.overflowY = "hidden";
    }

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id && m.status === "delivered"
            ? { ...m, status: "read" }
            : m
        )
      );
    }, 1000);
  }

  function deleteChat(chatId: number) {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setMessages((prev) => prev.filter((m) => m.chatId !== chatId));

    setSelectedChatId((prevSelected) => {
      if (prevSelected !== chatId) return prevSelected;

      const remaining = chats.filter((c) => c.id !== chatId);
      return remaining.length > 0 ? remaining[0].id : prevSelected;
    });
  }

  function getOrCreateDirectChat(targetUserId: number): number {
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return selectedChatId;

    const existing = chats.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.includes(currentUser.id) &&
        c.participantIds.includes(targetUserId)
    );

    if (existing) {
      return existing.id;
    }

    const newChatId = Date.now();

    const newChat: Chat = {
      id: newChatId,
      title: `Личный чат с ${targetUser.username}`,
      isGroup: false,
      participantIds: [currentUser.id, targetUserId],
    };

    setChats((prev) => [...prev, newChat]);
    return newChatId;
  }

  function openUserProfile(id: number) {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    setProfileUser(user);
    setProfileDraft(null);
    setProfileEditMode(false);
  }

  function openSelfProfile() {
    setProfileUser(currentUser);
    setProfileDraft(null);
    setProfileEditMode(false);
  }

  function startEditProfile() {
    if (!profileUser) return;
    setProfileDraft(profileUser);
    setProfileEditMode(true);
  }

  function closeProfile() {
    setProfileUser(null);
    setProfileDraft(null);
    setProfileEditMode(false);
  }

  function updateDraft<K extends keyof User>(field: K, value: User[K]) {
    if (!profileEditMode) return;
    setProfileDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function saveProfile() {
    if (!profileDraft) return;

    setUsers((prev) =>
      prev.map((u) => (u.id === profileDraft.id ? profileDraft : u))
    );

    if (currentUser.id === profileDraft.id) {
      setCurrentUser(profileDraft);
    }

    setProfileUser(profileDraft);
    setProfileDraft(null);
    setProfileEditMode(false);
  }

  function handleProfileAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profileEditMode) return;
    const url = URL.createObjectURL(file);
    updateDraft("avatarUrl", url);
  }

  function getInitials(name?: string) {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    <>
      {profileUser && displayProfile && (
        <div className="profile-modal-backdrop" onClick={closeProfile}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal__top">
              {isOwnProfile && !profileEditMode && (
                <button
                  className="profile-modal__top-edit-left"
                  type="button"
                  onClick={startEditProfile}
                  title="Редактировать профиль"
                >
                  ✏
                </button>
              )}

              <div className="profile-modal__avatar-big">
                {displayProfile.avatarUrl ? (
                  <img src={displayProfile.avatarUrl} alt="" />
                ) : (
                  getInitials(displayProfile.username)
                )}

                {profileEditMode && isOwnProfile && (
                  <label className="profile-modal__avatar-edit">
                    ✎
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleProfileAvatarChange}
                    />
                  </label>
                )}
              </div>

              <button
                className="profile-modal__top-close-right"
                type="button"
                onClick={closeProfile}
                title="Закрыть"
              >
                ✕
              </button>

              {profileEditMode ? (
                <input
                  className="profile-modal__field-input profile-modal__field-input--name"
                  value={displayProfile.username ?? ""}
                  onChange={(e) => updateDraft("username", e.target.value)}
                />
              ) : (
                <div className="profile-modal__name-text">
                  {displayProfile.username}
                </div>
              )}

              <div
                className={
                  "profile-modal__top-status " +
                  (displayProfile.status === "online"
                    ? "profile-modal__top-status--online"
                    : "")
                }
              >
                {displayProfile.status === "online" ? "в сети" : "не в сети"}
              </div>
            </div>

            <div className="profile-modal__body">
              <div className="profile-modal__field">
                <div className="profile-modal__field-label">Телефон</div>
                {profileEditMode ? (
                  <input
                    className="profile-modal__field-input"
                    value={displayProfile.phone ?? ""}
                    onChange={(e) => updateDraft("phone", e.target.value)}
                  />
                ) : (
                  <div className="profile-modal__field-value">
                    {displayProfile.phone || "—"}
                  </div>
                )}
              </div>

              <div className="profile-modal__field">
                <div className="profile-modal__field-label">О себе</div>
                {profileEditMode ? (
                  <textarea
                    className="profile-modal__field-textarea"
                    value={displayProfile.about ?? ""}
                    onChange={(e) => updateDraft("about", e.target.value)}
                  />
                ) : (
                  <div className="profile-modal__field-value">
                    {displayProfile.about || "—"}
                  </div>
                )}
              </div>

              <div className="profile-modal__field">
                <div className="profile-modal__field-label">
                  Имя пользователя
                </div>
                {profileEditMode ? (
                  <input
                    className="profile-modal__field-input"
                    value={displayProfile.handle ?? ""}
                    onChange={(e) => updateDraft("handle", e.target.value)}
                    placeholder="@username"
                  />
                ) : (
                  <div className="profile-modal__field-value">
                    {displayProfile.handle ? `@${displayProfile.handle}` : "—"}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-modal__footer">
              {profileEditMode ? (
                <div className="profile-modal__buttons">
                  <button
                    className="profile-modal__btn"
                    type="button"
                    onClick={closeProfile}
                  >
                    Отмена
                  </button>
                  <button
                    className="profile-modal__btn profile-modal__btn--primary"
                    type="button"
                    onClick={saveProfile}
                  >
                    Сохранить
                  </button>
                </div>
              ) : isOwnProfile ? (
                <div className="profile-modal__hint">
                  Нажмите ✏, чтобы отредактировать профиль
                </div>
              ) : (
                <div className="profile-modal__buttons">
                  <button
                    className="profile-modal__btn profile-modal__btn--primary"
                    type="button"
                    onClick={() => {
                      if (!profileUser) return;
                      const chatId = getOrCreateDirectChat(profileUser.id);
                      setSelectedChatId(chatId);
                      closeProfile();
                    }}
                  >
                    Написать
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="side-menu-backdrop" onClick={() => setIsMenuOpen(false)}>
          <div className="side-menu-panel" onClick={(e) => e.stopPropagation()}>
            <div className="side-menu-header">
              <div className="side-menu-avatar">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" />
                ) : (
                  getInitials(currentUser.username)
                )}
              </div>
              <div>
                <div className="side-menu-username">{currentUser.username}</div>
                <div className="side-menu-email">статус: {currentUser.status}</div>
              </div>
            </div>

            <label className="side-menu-item">
              Сменить аватар
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const url = URL.createObjectURL(file);
                  setCurrentUser((prev) => ({ ...prev, avatarUrl: url }));
                }}
              />
            </label>

            <div className="side-menu-section-title">Профиль</div>
            <div
              className="side-menu-item"
              onClick={() => {
                setIsMenuOpen(false);
                openSelfProfile();
              }}
            >
              Мой профиль
            </div>

            <div className="side-menu-section-title">Прочее</div>
            <div
              className="side-menu-item"
              onClick={() => {
                setIsContactsModalOpen(true);
                setIsMenuOpen(false);
              }}
            >
              Открыть список контактов
            </div>
            <div className="side-menu-item">Настройки</div>

            <div className="side-menu-footer">Messenger GG · учебный проект</div>
          </div>
        </div>
      )}

      {isContactsModalOpen && (
        <div
          className="contacts-modal-backdrop"
          onClick={() => setIsContactsModalOpen(false)}
        >
          <div className="contacts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="contacts-modal__header">
              <div className="contacts-modal__title">Контакты</div>
              <button
                className="contacts-modal__close-btn"
                onClick={() => setIsContactsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="contacts-modal__list">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="contacts-modal__item"
                  onClick={() => openUserProfile(u.id)}
                >
                  <div className="contacts-modal__avatar">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" />
                    ) : (
                      getInitials(u.username)
                    )}
                  </div>
                  <div className="contacts-modal__text">
                    <div className="contacts-modal__name">{u.username}</div>
                    <div className="contacts-modal__status">
                      {u.status === "online" ? "в сети" : "не в сети"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="contacts-modal__footer">
              <span>Всего контактов: {users.length}</span>
              <button onClick={() => setIsContactsModalOpen(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="messenger">
        <div className="sidebar">
          <div className="sidebar__header">
            <div className="sidebar__title">Чаты</div>
            <button
              className="sidebar__menu-btn"
              onClick={() => setIsMenuOpen(true)}
            >
              ☰
            </button>
          </div>

          <div className="sidebar__search">
            <input placeholder="Поиск" />
          </div>

          <div className="chat-list">
            {chats.map((chat) => {
              const isActive = chat.id === selectedChatId;

              const otherId = chat.participantIds.find(
                (id) => id !== currentUser.id
              );
              const otherUser = users.find((u) => u.id === otherId);

              const avatarUrl = otherUser?.avatarUrl ?? chat.avatarUrl;
              const initials = getInitials(chat.title);

              const lastText = chat.lastMessage
                ? chat.lastMessage.encryptedText
                  ? decryptLocal(chat.lastMessage.encryptedText)
                  : chat.lastMessage.text ?? ""
                : "";

              return (
                <div
                  key={chat.id}
                  className={
                    "chat-list__item" + (isActive ? " chat-list__item--active" : "")
                  }
                  onClick={() => setSelectedChatId(chat.id)}
                >
                  <div className="chat-list__avatar-wrapper">
                    {avatarUrl ? (
                      <img
                        className="chat-list__avatar-img"
                        src={avatarUrl}
                        alt=""
                      />
                    ) : (
                      <div className="chat-list__avatar">{initials}</div>
                    )}

                    {otherUser?.status === "online" && (
                      <span className="chat-list__avatar--online" />
                    )}
                  </div>

                  <div className="chat-list__content">
                    <div className="chat-list__title">{chat.title}</div>
                    <div className="chat-list__subtitle">{lastText}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chat">
          <div className="chat-header">
            <div>
              <div className="chat-header__title">
                {selectedChat?.title ?? "Чат"}
              </div>
              <div className="chat-header__subtitle">
                {selectedChat?.isGroup ? "Группа" : "Личный чат"}
              </div>
            </div>

            {selectedChat && (
              <div className="chat-header__right">
                {!selectedChat.isGroup && directChatUser && (
                  <div
                    className="chat-header__avatar"
                    onClick={() => openUserProfile(directChatUser.id)}
                    title={`Открыть профиль: ${directChatUser.username}`}
                  >
                    {directChatUser.avatarUrl ? (
                      <img src={directChatUser.avatarUrl} alt="" />
                    ) : (
                      <div className="chat-header__avatar-fallback">
                        {getInitials(directChatUser.username)}
                      </div>
                    )}
                  </div>
                )}

                <button
                  className="chat-header__delete"
                  type="button"
                  onClick={() => {
                    if (!selectedChat) return;
                    const ok = window.confirm(
                      selectedChat.isGroup
                        ? "Удалить этот групповой чат?"
                        : "Удалить личный чат?"
                    );
                    if (!ok) return;
                    deleteChat(selectedChat.id);
                  }}
                  title="Удалить чат"
                >
                  🗑
                </button>
              </div>
            )}
          </div>

          <div className="chat-messages">
            {chatMessages.map((msg) => {
              const sender = users.find((u) => u.id === msg.senderId);
              const isOwn = msg.senderId === currentUser.id;
              const time = new Date(msg.createdAt)
                .toLocaleTimeString()
                .slice(0, 5);

              const displayText = msg.encryptedText
                ? decryptLocal(msg.encryptedText)
                : msg.text ?? "";

              return (
                <div
                  key={msg.id}
                  className={"msg-row" + (isOwn ? " msg-row--own" : "")}
                >
                  <div className="msg-avatar-wrap">
                    <div
                      className="msg-avatar"
                      onClick={() => sender && openUserProfile(sender.id)}
                      title={sender ? `Открыть профиль: ${sender.username}` : ""}
                    >
                      {sender?.avatarUrl ? (
                        <img src={sender.avatarUrl} alt="" />
                      ) : (
                        getInitials(sender?.username)
                      )}
                      <span
                        className={
                          "msg-status-dot " +
                          (sender?.status === "online"
                            ? "msg-status-dot--online"
                            : "")
                        }
                      />
                    </div>
                  </div>

                  <div className="msg-main">
                    <div className="msg-header">
                      <span className="msg-author">
                        {isOwn ? "Вы" : sender?.username ?? "Контакт"}
                      </span>
                    </div>
                    <div
                      className={
                        "msg-bubble " +
                        (isOwn ? "msg-bubble--own" : "msg-bubble--other")
                      }
                    >
                      <div className="msg-text">{displayText}</div>
                      <div className="msg-meta">
                        <span className="msg-time">{time}</span>
                        {isOwn && (
                          <span
                            className={
                              "msg-status-icon " + (msg.status ?? "delivered")
                            }
                          >
                            {msg.status === "read" ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <textarea
              ref={messageInputRef}
              className="chat-input-textarea"
              placeholder="Введите сообщение..."
              value={messageText}
              onChange={handleMessageInput}
              onKeyDown={handleMessageKeyDown}
            />
            <button
              className="chat-input-send"
              onClick={sendMessage}
              title="Enter — отправить, Shift+Enter — перенос строки"
              disabled={!messageText.trim()}
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
