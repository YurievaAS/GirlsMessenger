import { useState } from "react";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { MessengerPage } from "./pages/MessengerPage";

type Page = "login" | "register" | "reset" | "messenger";

function App() {
  const [page, setPage] = useState<Page>("login");

  (window as any).goToMessenger = () => setPage("messenger");

  return (
    <div className="app-root">
      {page === "login" && (
        <LoginPageWrapper onChangePage={setPage} />
      )}
      {page === "register" && (
        <RegisterPageWrapper onChangePage={setPage} />
      )}
      {page === "reset" && (
        <ResetPasswordPageWrapper onChangePage={setPage} />
      )}
      {page === "messenger" && <MessengerPage />}
    </div>
  );
}

interface PageWrapperProps {
  onChangePage: (page: Page) => void;
}

function LoginPageWrapper({ onChangePage }: PageWrapperProps) {
  return (
    <>
      <LoginPage
        onSuccess={() => onChangePage("messenger")}
        onGoToRegister={() => onChangePage("register")}
        onGoToReset={() => onChangePage("reset")}
      />
    </>
  );
}

function RegisterPageWrapper({ onChangePage }: PageWrapperProps) {
  return (
    <>
      <RegisterPage
        onSuccess={() => onChangePage("messenger")}
        onGoToLogin={() => onChangePage("login")}
      />
    </>
  );
}

function ResetPasswordPageWrapper({ onChangePage }: PageWrapperProps) {
  return (
    <ResetPasswordPage onGoToLogin={() => onChangePage("login")} />
  );
}

export default App;
