// src/utils/api.js

const USER_TOKEN = 123; // временно, после ще го правиш dynamic

const COLUMN_TO_STATE_ID = {
  todo: 1,
  inprogress: 2,
  done: 3,
};

const PRIORITY_TO_INT = { low: 1, medium: 2, high: 3 };
const INT_TO_PRIORITY = { 1: "low", 2: "medium", 3: "high" };

export async function fetchTasks() {
  const res = await fetch(`/api/v1/tasks/user/${USER_TOKEN}`);
  if (!res.ok) throw new Error(`Failed to load tasks: ${res.status}`);
  const data = await res.json();
  return data.map(fromBackendTask);
}

export async function createTask(frontTask) {
  const body = toBackendTask(frontTask, { mode: "create" });

  const res = await fetch(`/api/v1/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);

  const created = await res.json();
  return fromBackendTask(created);
}

// ✅ UPDATE (PUT) - used for moving task between columns, editing, etc.
export async function updateTask(frontTask) {
  if (typeof frontTask?.index !== "number") {
    throw new Error("updateTask requires task.index (number)");
  }

  const body = toBackendTask(frontTask, { mode: "update" });

  const res = await fetch(`/api/v1/tasks`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);

  const updated = await res.json();
  return fromBackendTask(updated);
}

// ✅ DELETE single task by index
export async function deleteTask(index) {
  if (typeof index !== "number") {
    throw new Error("deleteTask requires index (number)");
  }

  const res = await fetch(`/api/v1/tasks/${index}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`);
  return res.text();
}

// ✅ DELETE ALL tasks for current user (frontend only helper)
export async function deleteAllTasks() {
  const tasks = await fetchTasks();
  for (const t of tasks) {
    await deleteTask(t.index);
  }
  return true;
}

/* =======================
   Mapping helpers
   ======================= */

function fromBackendTask(t) {
  return {
    id: String(t.index),
    index: t.index,

    columnId: stateIdToColumn(t.state?.id),
    priority: INT_TO_PRIORITY[t.priority] ?? "medium",

    title: t.title ?? "",
    description: t.desc ?? "",

    // ✅ keep it so we don't overwrite it with "N/A" on update
    tszImplement: t.tszImplement ?? null,

    createdAt: Date.now(),
  };
}

/**
 * mode:
 * - "create": if index missing -> generate
 * - "update": must keep existing index
 */
function toBackendTask(frontTask, { mode } = { mode: "create" }) {
  let index;

  if (mode === "update") {
    index = frontTask.index; // already validated
  } else {
    index =
      typeof frontTask.index === "number"
        ? frontTask.index
        : generateIndex();
  }

  const payload = {
    index,
    userToken: { token: USER_TOKEN },
    deleted: false,

    title: frontTask.title ?? "",
    desc: frontTask.description ?? "",

    priority: PRIORITY_TO_INT[frontTask.priority] ?? 2,
    state: { id: COLUMN_TO_STATE_ID[frontTask.columnId] ?? 1 },
  };

  // ✅ only send tszImplement if we have one (avoid overwriting DB with "N/A")
  if (frontTask.tszImplement != null && String(frontTask.tszImplement).trim() !== "") {
    payload.tszImplement = frontTask.tszImplement;
  }

  return payload;
}

function generateIndex() {
  // safer than last 6 digits (less collisions on import)
  // 9 digits from timestamp + 2 random digits
  const timePart = Number(String(Date.now()).slice(-9));
  const rnd = Math.floor(Math.random() * 100); // 0..99
  return timePart * 100 + rnd;
}

function stateIdToColumn(id) {
  if (id === 1) return "todo";
  if (id === 2) return "inprogress";
  if (id === 3) return "done";
  return "todo";
}
