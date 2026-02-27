import styles from "./Board.module.css";
import { PRIORITY_META } from "../../utils/priority";

export default function TaskCard({ task, index, onDelete }) {
  const meta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;

  async function handleDelete(e) {
    e.stopPropagation(); // safety: prevent parent clicks

    if (!onDelete) return;

    const ok = confirm(`Delete "${task.title}"?`);
    if (!ok) return;

    try {
      await onDelete(task);
    } catch {
      alert("Failed to delete task");
    }
  }

  return (
    <article className={styles.card}>
      {/* ✅ DELETE CHIP — absolute top-right, aligned with indexChip */}
      <button
        type="button"
        className={styles.chipIconBtn}
        title="Delete task"
        aria-label="Delete task"
        onClick={handleDelete}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M9 3h6l1 2h4v2H4V5h4l1-2Z"
            fill="currentColor"
          />
          <path
            d="M9 10h2v9H9v-9Zm4 0h2v9h-2v-9ZM7 10h2v9H7v-9Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* ✅ TITLE */}
      <div className={styles.cardTitle}>
        {task.title}
      </div>

      {/* ✅ DESCRIPTION */}
      <div className={styles.cardDesc}>
        {task.description}
      </div>

      {/* ✅ FOOTER */}
      <div className={styles.cardFooter}>
        <div
          className={styles.priorityBadge}
          style={{ ["--prioOpacity"]: `var(${meta.opacityVar})` }}
        >
          <span className={styles.triangle} />
          <span className={styles.priorityText}>
            {meta.label}
          </span>
        </div>

        {/* ✅ INDEX CHIP — absolute bottom-right */}
        <div className={styles.indexChip}>
          {index}
        </div>
      </div>
    </article>
  );
}