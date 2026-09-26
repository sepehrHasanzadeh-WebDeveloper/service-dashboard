"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="dashboard-shell theme-dark min-h-screen" dir="rtl">
      <div className="dashboard-container">
        <section className="dashboard-empty glass-card" role="alert">
          <h2>بارگذاری داشبورد با خطا مواجه شد</h2>
          <p>اتصال به داشبورد قطع شد. دوباره تلاش کنید.</p>
          <button className="modal-submit" type="button" onClick={() => reset()}>تلاش دوباره</button>
        </section>
      </div>
    </main>
  );
}
