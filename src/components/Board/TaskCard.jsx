import styles from "./Board.module.css";
import { PRIORITY_META } from "../../utils/priority";

export default function TaskCard({ task, index }) {
  const meta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;

  return (
    <article className={styles.card}>
      <div className={styles.cardTitle}>{task.title}</div>
      <div className={styles.cardDesc}>{task.description}</div>

      <div className={styles.cardFooter}>
        <div
          className={styles.priorityBadge}
          style={{ ["--prioOpacity"]: `var(${meta.opacityVar})` }}
        >
          <span className={styles.triangle} />
          <span className={styles.priorityText}>{meta.label}</span>
        </div>

        <div className={styles.indexChip}>{index}</div>
      </div>
    </article>
  );
}