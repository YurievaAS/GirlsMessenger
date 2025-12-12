import { useState } from "react";

interface ResetPasswordPageProps {
  onGoToLogin: () => void;
}

export function ResetPasswordPage({ onGoToLogin }: ResetPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Введите email.");
      return;
    }

    setLoading(true);

    try {

      console.log("Запрос на восстановление пароля для:", email);

      setSuccess(
        "Если такой email зарегистрирован, на него отправлено письмо с инструкциями."
      );
    } catch (err: any) {
      console.error(err);
      setError("Не удалось отправить запрос. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-header">
          <h2 className="auth-title">Восстановление пароля</h2>
          <p className="auth-subtitle">
            Укажи почту, мы проверим, есть ли такой аккаунт
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {success && (
          <div className="auth-error" style={{ color: "#146c43", background: "#d1f2e4", borderColor: "#8fd5b5" }}>
            {success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="Ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="auth-button auth-button-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? "Отправляем..." : "Восстановить"}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="auth-link-button"
            onClick={onGoToLogin}
          >
            Вернуться ко входу
          </button>
        </div>
      </div>
    </div>
  );
}
