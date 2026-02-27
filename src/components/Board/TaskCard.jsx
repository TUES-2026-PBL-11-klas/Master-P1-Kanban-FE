import styles from "./Board.module.css";
import { PRIORITY_META } from "../../utils/priority";

export default function TaskCard({ task, index, onDelete }) {
  const meta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;

  async function handleDelete() {
    if (!onDelete) return;
    const ok = confirm(`Delete "${task.title}"?`);
    if (!ok) return;
    await onDelete(task);
  }

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

        {/* 🗑️ delete single task */}
        <button
          type="button"
          onClick={handleDelete}
          title="Delete task"
          style={{
            marginLeft: 8,
            width: 30,
            height: 30,
            borderRadius: 10,
            border: "1px solid rgba(79,55,138,.18)",
            background: "rgba(255,255,255,.6)",
            cursor: "pointer",
          }}
        >
          🗑️
        </button>
      </div>
    </article>
  );
}