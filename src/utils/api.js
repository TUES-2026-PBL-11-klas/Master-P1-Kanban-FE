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
  const body = toBackendTask(frontTask);
  const res = await fetch(`/api/v1/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to create task: ${res.status}`);
  const created = await res.json();
  return fromBackendTask(created);
}

// ✅ NEW: delete endpoint
export async function deleteTask(index) {
  const res = await fetch(`/api/v1/tasks/${index}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete task: ${res.status}`);
  return res.text(); // backend връща String message
}

function fromBackendTask(t) {
  return {
    // frontend expects these names:
    id: String(t.index), // стабилен key за React
    index: t.index, // ✅ важно за DELETE /api/v1/tasks/{index}
    columnId: stateIdToColumn(t.state?.id),
    priority: INT_TO_PRIORITY[t.priority] ?? "medium",
    title: t.title ?? "",
    description: t.desc ?? "",
    createdAt: Date.now(), // backend няма createdAt
  };
}

function toBackendTask(frontTask) {
  // ако създаваш нов task, трябва да дадеш уникален index
  const index =
    typeof frontTask.index === "number"
      ? frontTask.index
      : Number(String(Date.now()).slice(-6)); // 6 цифри, за да не е огромно

  return {
    index,
    userToken: { token: USER_TOKEN },
    deleted: false,
    title: frontTask.title,
    desc: frontTask.description,
    priority: PRIORITY_TO_INT[frontTask.priority] ?? 2,
    state: { id: COLUMN_TO_STATE_ID[frontTask.columnId] ?? 1 },
    tszImplement: "N/A",
  };
}

function stateIdToColumn(id) {
  if (id === 1) return "todo";
  if (id === 2) return "inprogress";
  if (id === 3) return "done";
  return "todo";
}