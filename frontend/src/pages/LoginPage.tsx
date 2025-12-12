import { useState } from "react";
import { login } from "../api/auth";
import { ApiError } from "../api/http";

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onGoToReset: () => void;
}

export function LoginPage({
  onSuccess,
  onGoToRegister,
  onGoToReset,
}: LoginPageProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [offerRegister, setOfferRegister] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOfferRegister(false);

    if (!emailOrUsername || !password) {
      setError("Введите логин и пароль.");
      return;
    }

    setLoading(true);

    try {
      // реальный вызов бэка
      // backend может ожидать email или username в одном поле
      await login({ email: emailOrUsername, password });

      // токены и user уже сохранены в auth.ts
      onSuccess(); // → messenger
    } catch (err: any) {
      console.error(err);

      if (err instanceof ApiError) {
        if (err.status === 401 || err.status === 400) {
          // пользователь есть, но пароль/логин неверный
          setError("Неверный логин или пароль.");
          setOfferRegister(false);
        } else if (err.status === 404) {
          // бэк явно сказал, что такого пользователя нет
          setError("Аккаунт с такими данными не найден.");
          setOfferRegister(true);
        } else {
          setError("Ошибка сервера. Попробуйте позже.");
        }
      } else {
        setError("Не удалось подключиться к серверу.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2 className="auth-title">Вход</h2>
          <p className="auth-subtitle">
            <i>✨ Заходит улитка в бар ✨</i>
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Логин или email</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Введите логин или email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              className="auth-input"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="auth-button auth-button-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link-button"
            onClick={onGoToReset}
          >
            Забыли пароль?
          </button>

          <button
            type="button"
            className="auth-link-button auth-link-button-accent"
            onClick={onGoToRegister}
          >
            Создать аккаунт
          </button>
        </div>

        {offerRegister && (
          <div className="auth-suggestion">
            Аккаунт не найден.{" "}
            <button
              type="button"
              className="auth-inline-link"
              onClick={onGoToRegister}
            >
              Создать новый
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
