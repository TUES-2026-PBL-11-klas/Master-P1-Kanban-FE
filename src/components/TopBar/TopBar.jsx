import styles from "./TopBar.module.css";

export default function TopBar({
  sortMode,
  onDeleteAll,
  onToggleSort,
  onNewTask,
  onExport,
  onImport,
}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <div className={styles.title}>Kanban Board</div>
        <div className={styles.subtitle}>Manage your tasks efficiently</div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconChip}
          onClick={onDeleteAll}
          title="Delete all tasks"
          type="button"
        >
          🗑
        </button>

        <button className={styles.pillBtn} onClick={onExport} type="button">
          Export CSV <span className={styles.plus}>+</span>
        </button>

        <button className={styles.pillBtn} onClick={onImport} type="button">
          Import CSV <span className={styles.plus}>+</span>
        </button>

        <button className={styles.newTaskBtn} onClick={onNewTask} type="button">
          New task <span className={styles.plus}>+</span>
        </button>

        <button
          className={styles.iconBtn}
          onClick={onToggleSort}
          title={`Sort: ${sortMode}`}
          type="button"
        >
          ⇢
        </button>
      </div>
    </header>
  );
}
