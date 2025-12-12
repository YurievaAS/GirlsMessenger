import { useState } from "react";
import { register } from "../api/auth";
import { ApiError } from "../api/http";

interface RegisterPageProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export function RegisterPage({ onSuccess, onGoToLogin }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username || !email || !password || !repeatPassword) {
      setError("Заполните все поля.");
      return;
    }

    if (password !== repeatPassword) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    try {
      // register сам сохранит access/refresh токены и user в localStorage
      await register({ username, email, password });

      // успешная регистрация → переходим в мессенджер
      onSuccess();
    } catch (err: any) {
      console.error(err);

      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(
            "Пользователь с таким email уже существует. Попробуйте войти в аккаунт."
          );
        } else if (err.status === 400) {
          const backendMsg =
            (err as any).details?.message ||
            (err as any).message ||
            null;
          setError(
            backendMsg || "Некорректные данные. Проверьте поля."
          );
        } else {
          setError("Ошибка сервера. Попробуйте позже.");
        }
      } else {
        setError(err?.message || "Не удалось подключиться к серверу.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2 className="auth-title">Регистрация</h2>
          <p className="auth-subtitle">
            Создайте аккаунт, чтобы попасть в мессенджер 💌
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Имя пользователя</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Повторите пароль</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Повторите пароль"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>

          <button
            className="auth-button auth-button-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Создаем..." : "Создать аккаунт"}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link-button"
            onClick={onGoToLogin}
          >
            Уже есть аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}
