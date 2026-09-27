import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="dashboard-shell min-h-screen" dir="rtl">
      <div className="dashboard-container">
        <section className="dashboard-loading" aria-live="polite" aria-busy="true">
          <LoaderCircle className="loading-spinner" size={28} />
          <strong>در حال بارگذاری داشبورد...</strong>
          <span>لطفاً چند لحظه صبر کنید.</span>
        </section>
      </div>
    </main>
  );
}
