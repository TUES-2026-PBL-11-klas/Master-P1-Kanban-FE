import TaskCard from "./TaskCard";
import styles from "./Board.module.css";

export default function Column({ columnId, title, tasks, onAddTask, onDeleteTask }) {
  function handleAdd() {
    if (!onAddTask) return;
    onAddTask(columnId);
  }

  return (
    <section className={styles.column}>
      <div className={styles.colHeader}>
        <div className={styles.colTitle}>{title}</div>

        <button
          className={styles.colPlus}
          title="Add task"
          type="button"
          onClick={handleAdd}
        >
          +
        </button>
      </div>

      <div className={styles.colBody}>
        {tasks.map((t, idx) => (
          <TaskCard
            key={t.id}
            task={t}
            index={idx + 1}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </section>
  );
}