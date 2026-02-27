
import { useEffect, useRef, useState } from "react";
import styles from "./Board.module.css";
import { PRIORITY_META } from "../../utils/priority";

const MOVE_OPTIONS = [
  { id: "todo", label: "To do" },
  { id: "inprogress", label: "In progress" },
  { id: "done", label: "Done" },
];

export default function TaskCard({ task, index, onDelete, onMove, currentColumnId }) {
  const meta = PRIORITY_META[task.priority] ?? PRIORITY_META.medium;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  // close on outside click + ESC
  useEffect(() => {
    function onDocDown(e) {
      if (!menuOpen) return;
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e) {
      if (!menuOpen) return;
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  async function handleDelete(e) {
    e.stopPropagation();
    setMenuOpen(false);

    if (!onDelete) return;

    const ok = confirm(`Delete "${task.title}"?`);
    if (!ok) return;

    try {
      await onDelete(task);
    } catch {
      alert("Failed to delete task");
    }
  }

  async function handleMove(toColumnId) {
    setMenuOpen(false);

    if (!onMove) return;

    // safety: do nothing if already there
    const current = currentColumnId ?? task.columnId;
    if (toColumnId === current) return;

    try {
      await onMove(task, toColumnId);
    } catch {
      alert("Failed to move task");
    }
  }

  const current = currentColumnId ?? task.columnId;

  return (
    <article className={styles.card}>
      {/* ✅ MENU CHIP — absolute top-right */}
      <div className={styles.menuWrap} ref={menuWrapRef}>
        <button
          type="button"
          className={styles.chipIconBtn}
          title="Task menu"
          aria-label="Task menu"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
        >
          {/* ⋮ icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 5.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Zm0 7a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Zm0 7a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {menuOpen && (
          <div className={styles.dropdownMenu} role="menu">
            <div className={styles.menuLabel}>Move to</div>

            {MOVE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={styles.menuItem}
                onClick={() => handleMove(opt.id)}
                disabled={opt.id === current}
                title={opt.id === current ? "Already here" : `Move to ${opt.label}`}
              >
                <span>{opt.label}</span>
                {opt.id === current ? <span className={styles.menuDot}>•</span> : null}
              </button>
            ))}

            <div className={styles.menuDivider} />

            <button
              type="button"
              className={`${styles.menuItem} ${styles.menuDanger}`}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* ✅ TITLE */}
      <div className={styles.cardTitle}>{task.title}</div>

      {/* ✅ DESCRIPTION */}
      <div className={styles.cardDesc}>{task.description}</div>

      {/* ✅ FOOTER */}
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
