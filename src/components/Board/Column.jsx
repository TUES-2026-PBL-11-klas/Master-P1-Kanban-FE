import TaskCard from "./TaskCard";
import styles from "./Board.module.css";

export default function Column({ title, tasks }) {
  return (
    <section className={styles.column}>
      <div className={styles.colHeader}>
        <div className={styles.colTitle}>{title}</div>
        <button className={styles.colPlus} title="Add (later)" type="button">
          +
        </button>
      </div>

      <div className={styles.colBody}>
        {tasks.map((t, idx) => (
          <TaskCard key={t.id} task={t} index={idx + 1} />
        ))}
      </div>
    </section>
  );
}