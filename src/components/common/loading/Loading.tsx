import { LoaderCircle } from "lucide-react";
import styles from "./Loading.module.css";

export default function Loading() {
  return (
    <section className={styles.loading} aria-live="polite" aria-busy="true">
      <LoaderCircle className={styles.spinner} size={28} />
      <strong>در حال بارگذاری داشبورد...</strong>
      <span>لطفاً چند لحظه صبر کنید.</span>
    </section>
  );
}
