import { useEffect, useMemo, useState } from "react";
import ModalShell from "./ModalShell";
import styles from "./NewTaskModal.module.css";
import { PRIORITY_META } from "../../utils/priority";

const COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "inprogress", label: "In progress" },
  { id: "done", label: "Done" },
];

const PRIORITIES = ["high", "medium", "low"];

export default function NewTaskModal({
  sortMode,
  onClose,
  onCreate,
  initialColumnId = null,
}) {
  const [step, setStep] = useState(0);

  const [columnId, setColumnId] = useState(initialColumnId);
  const [priority, setPriority] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Ако modal-a е отворен от плюсчето на колона -> preset колоната и прескачаме Column step-а
  // Ако е отворен от горния бутон -> започваме от Column step-а
  useEffect(() => {
    if (initialColumnId) {
      setColumnId(initialColumnId);
      setStep(1); // директно към Priority
    } else {
      setColumnId(null);
      setStep(0);
    }

    // по желание: при всяко отваряне да почва "на чисто"
    setPriority(null);
    setTitle("");
    setDescription("");
  }, [initialColumnId]);

  const canNext = useMemo(() => {
    if (step === 0) return !!columnId;
    if (step === 1) return !!priority;
    if (step === 2) return title.trim().length > 0;
    if (step === 3) return description.trim().length > 0;
    return false;
  }, [step, columnId, priority, title, description]);

  function next() {
    if (!canNext) return;
    setStep((s) => Math.min(3, s + 1));
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function create() {
    if (!columnId || !priority) return;
    if (!title.trim() || !description.trim()) return;

    onCreate({
      columnId,
      priority,
      title: title.trim(),
      description: description.trim(),
    });
    onClose();
  }

  return (
    <ModalShell title="New task" onClose={onClose}>
      <div className={styles.subHeader}>
        <div className={styles.stepPills}>
          <span className={`${styles.pill} ${step === 0 ? styles.active : ""}`}>Column</span>
          <span className={`${styles.pill} ${step === 1 ? styles.active : ""}`}>Priority</span>
          <span className={`${styles.pill} ${step === 2 ? styles.active : ""}`}>Title</span>
          <span className={`${styles.pill} ${step === 3 ? styles.active : ""}`}>Description</span>
        </div>

        <div className={styles.hint}>
          Sorting: <b>{sortMode === "priority" ? "by priority" : "none"}</b>
        </div>
      </div>

      {step === 0 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Choose category</div>
          <div className={styles.grid3}>
            {COLUMNS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`${styles.choiceCard} ${columnId === c.id ? styles.choiceActive : ""}`}
                onClick={() => setColumnId(c.id)}
              >
                <div className={styles.choiceTitle}>{c.label}</div>
                <div className={styles.choiceSub}>Add task to this column</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 1 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Choose priority</div>
          <div className={styles.grid3}>
            {PRIORITIES.map((p) => {
              const meta = PRIORITY_META[p];
              return (
                <button
                  key={p}
                  type="button"
                  className={`${styles.choiceCard} ${priority === p ? styles.choiceActive : ""}`}
                  onClick={() => setPriority(p)}
                >
                  <div className={styles.choiceTitle} style={{ textTransform: "capitalize" }}>
                    {p}
                  </div>

                  <div
                    className={styles.previewBadge}
                    style={{ ["--prioOpacity"]: `var(${meta.opacityVar})` }}
                  >
                    <span className={styles.triangle} />
                    <span className={styles.previewText}>{meta.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Task title</div>
          <input
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            autoFocus
          />
          <div className={styles.helper}>Required. Keep it short and clear.</div>
        </section>
      )}

      {step === 3 && (
        <section className={styles.section}>
          <div className={styles.sectionTitle}>Task description</div>
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description..."
            rows={6}
            autoFocus
          />
          <div className={styles.helper}>Required. Cards will auto-grow if the text is long.</div>
        </section>
      )}

      <div className={styles.footer}>
        <button className={styles.ghostBtn} type="button" onClick={onClose}>
          Cancel
        </button>

        <div className={styles.footerRight}>
          <button className={styles.ghostBtn} type="button" onClick={back} disabled={step === 0}>
            Back
          </button>

          {step < 3 ? (
            <button className={styles.primaryBtn} type="button" onClick={next} disabled={!canNext}>
              Next
            </button>
          ) : (
            <button className={styles.primaryBtn} type="button" onClick={create} disabled={!canNext}>
              Create task
            </button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}