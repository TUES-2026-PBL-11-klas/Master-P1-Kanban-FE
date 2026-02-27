// src/store/useKanbanStore.js
import { useMemo, useRef, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { PRIORITY_RANK } from "../utils/priority";
import {
  fetchTasks,
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  updateTask as apiUpdateTask,
} from "../utils/api";

const now = Date.now();

/**
 * Demo tasks (only for production).
 * not loading automatically.
 */
const seedTasks = [
  {
    id: nanoid(),
    columnId: "todo",
    priority: "high",
    title: "Design login page",
    description: "Create UI and validation",
    createdAt: now - 500000,
  },
  {
    id: nanoid(),
    columnId: "todo",
    priority: "low",
    title: "Update footer links",
    description: "Fix outdated links and improve layout spacing.",
    createdAt: now - 400000,
  },
  {
    id: nanoid(),
    columnId: "todo",
    priority: "medium",
    title: "Improve search functionality",
    description: "Add filters and optimize search results for faster performance.",
    createdAt: now - 300000,
  },
  {
    id: nanoid(),
    columnId: "inprogress",
    priority: "medium",
    title: "Improve mobile responsiveness",
    description: "Adjust layout for smaller screens and fix spacing issues.",
    createdAt: now - 200000,
  },
  {
    id: nanoid(),
    columnId: "inprogress",
    priority: "high",
    title: "Fix login authentication bug",
    description: "Users cannot log in after password reset. Needs urgent fix.",
    createdAt: now - 150000,
  },
  {
    id: nanoid(),
    columnId: "done",
    priority: "low",
    title: "Fix API bug",
    description: "Handle error states",
    createdAt: now - 100000,
  },
  {
    id: nanoid(),
    columnId: "done",
    priority: "medium",
    title: "Add notifications panel",
    description: "Create UI for user notifications with unread indicator.",
    createdAt: now - 50000,
  },
];

function sortColumnTasks(tasks, sortMode) {
  if (sortMode === "none") {
    return [...tasks].sort((a, b) => a.createdAt - b.createdAt);
  }

  return [...tasks].sort((a, b) => {
    const pr = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (pr !== 0) return pr;
    return a.createdAt - b.createdAt;
  });
}

export function useKanbanStore() {
  const [tasks, setTasks] = useState([]);
  const [sortMode, setSortMode] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ always have latest tasks available for stable actions
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // ✅ actions must be stable, иначе App useEffect цикли
  const actions = useMemo(() => {
    return {
      async loadFromApi() {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchTasks();
          setTasks(data);
        } catch (e) {
          setError(e?.message ?? String(e));
        } finally {
          setIsLoading(false);
        }
      },

      async createTask(input) {
        setError(null);
        try {
          const created = await apiCreateTask(input);
          setTasks((prev) => [...prev, created]);
          return created;
        } catch (e) {
          setError(e?.message ?? String(e));
          throw e;
        }
      },

      async deleteTask(task) {
        const idx = task?.index;
        if (typeof idx !== "number") {
          const msg = "Cannot delete: missing task.index (backend id).";
          setError(msg);
          throw new Error(msg);
        }

        setError(null);
        try {
          await apiDeleteTask(idx);
          setTasks((prev) => prev.filter((t) => t.index !== idx));
        } catch (e) {
          setError(e?.message ?? String(e));
          throw e;
        }
      },

      async deleteAllFromApi() {
        setError(null);

        // ✅ snapshot from ref (latest tasks) — no weird setState hacks
        const snapshot = tasksRef.current ?? [];

        try {
          for (const t of snapshot) {
            if (typeof t.index === "number") {
              await apiDeleteTask(t.index);
            }
          }
          setTasks([]);
        } catch (e) {
          setError(e?.message ?? String(e));
          throw e;
        }
      },

      // ✅ move task between columns (PUT към backend + update UI)
      async moveTask(task, toColumnId) {
        const idx = task?.index;
        if (typeof idx !== "number") {
          const msg = "Cannot move: missing task.index (backend id).";
          setError(msg);
          throw new Error(msg);
        }

        if (!toColumnId) {
          const msg = "Cannot move: missing target columnId.";
          setError(msg);
          throw new Error(msg);
        }

        if (task.columnId === toColumnId) return task; // no-op

        setError(null);

        const prevColumnId = task.columnId;

        // optimistic UI
        setTasks((prev) =>
          prev.map((t) => (t.index === idx ? { ...t, columnId: toColumnId } : t))
        );

        try {
          const updated = await apiUpdateTask({ ...task, columnId: toColumnId });

          setTasks((prev) =>
            prev.map((t) => (t.index === idx ? { ...t, ...updated } : t))
          );

          return updated;
        } catch (e) {
          // rollback
          setTasks((prev) =>
            prev.map((t) =>
              t.index === idx ? { ...t, columnId: prevColumnId } : t
            )
          );

          setError(e?.message ?? String(e));
          throw e;
        }
      },

      // UI only
      deleteAll() {
        setTasks([]);
      },

      toggleSortMode() {
        setSortMode((prev) => (prev === "none" ? "priority" : "none"));
      },

      loadDemo() {
        setTasks(seedTasks);
      },

      reset() {
        setTasks([]);
      },
    };
  }, []);

  const derived = useMemo(() => {
    const byColumn = { todo: [], inprogress: [], done: [] };

    for (const t of tasks) {
      if (!byColumn[t.columnId]) continue;
      byColumn[t.columnId].push(t);
    }

    return {
      byColumn: {
        todo: sortColumnTasks(byColumn.todo, sortMode),
        inprogress: sortColumnTasks(byColumn.inprogress, sortMode),
        done: sortColumnTasks(byColumn.done, sortMode),
      },
      counts: {
        todo: byColumn.todo.length,
        inprogress: byColumn.inprogress.length,
        done: byColumn.done.length,
      },
    };
  }, [tasks, sortMode]);

  return { state: { tasks, sortMode, isLoading, error }, derived, actions };
}
