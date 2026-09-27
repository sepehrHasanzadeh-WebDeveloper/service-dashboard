"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json() as { error?: string };

      if (!response.ok) {
        setError(result.error || "ورود انجام نشد. دوباره تلاش کنید.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page} dir="rtl">
      <div className={styles.themeToggle}><ThemeToggle /></div>
      <section className={styles.card} aria-labelledby="login-title">
        <div className={styles.brandMark} aria-hidden="true"><KeyRound size={22} /></div>
        <span className={styles.eyebrow}>مرکز دسترسی شرکت</span>
        <h1 id="login-title">ورود به داشبورد</h1>
        <p className={styles.description}>برای دسترسی به سرویس‌های شرکت، اطلاعات ورود خود را وارد کنید.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>نام کاربری</span>
            <span className={styles.inputWrap}>
              <UserRound size={17} aria-hidden="true" />
              <input
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="نام کاربری را وارد کنید"
                autoComplete="username"
                required
                autoFocus
              />
            </span>
          </label>

          <label className={styles.field}>
            <span>رمز عبور</span>
            <span className={styles.inputWrap}>
              <KeyRound size={17} aria-hidden="true" />
              <input
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="رمز عبور را وارد کنید"
                autoComplete="current-password"
                required
              />
            </span>
          </label>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            <LogIn size={17} />
            {isSubmitting ? "در حال بررسی..." : "ورود به داشبورد"}
          </button>
        </form>

    
      </section>
    </main>
  );
}
