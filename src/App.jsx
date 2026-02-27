import { useEffect, useState } from "react";
import TopBar from "./components/TopBar/TopBar";
import Board from "./components/Board/Board";
import { useKanbanStore } from "./store/useKanbanStore";
import NewTaskModal from "./components/Modals/NewTaskModal";

export default function App() {
  const { state, derived, actions } = useKanbanStore();

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [presetColumnId, setPresetColumnId] = useState(null);

  // ✅ load tasks from backend ONCE on first render
  useEffect(() => {
    actions.loadFromApi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNewTask(columnId = null) {
    setPresetColumnId(columnId);
    setIsNewTaskOpen(true);
  }

  function closeNewTask() {
    setIsNewTaskOpen(false);
    setPresetColumnId(null);
  }

  async function handleCreateTask(input) {
    try {
      await actions.createTask(input);
      closeNewTask();
    } catch (e) {
      alert(state.error ?? "Failed to create task");
    }
  }

  // ✅ delete single task (DB + UI)
  async function handleDeleteTask(task) {
    try {
      await actions.deleteTask(task);
    } catch (e) {
      alert(state.error ?? "Failed to delete task");
    }
  }

  // ✅ delete all tasks (DB + UI)
  async function handleDeleteAll() {
    const ok = confirm("Delete ALL tasks? This will remove them from the database.");
    if (!ok) return;

    try {
      await actions.deleteAllFromApi();
    } catch (e) {
      alert(state.error ?? "Failed to delete all tasks");
    }
  }

  return (
    <div className="appShell">
      <TopBar
        sortMode={state.sortMode}
        onDeleteAll={handleDeleteAll}
        onToggleSort={actions.toggleSortMode}
        onNewTask={() => openNewTask(null)}
        onExport={() => alert("Export CSV idva sledvashtata stupka ")}
        onImport={() => alert("Import CSV idva sledvashtata stupka ")}
      />

      <div className="topDivider" />

      <main className="boardArea">
        <div className="leftRail">
          <button
            className="iconBtn"
            onClick={actions.toggleSortMode}
            title="Filter / Sort"
            type="button"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16l-6 7v4l-4 2v-6L4 6z"
                stroke="rgba(79,55,138,.9)"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="columns">
          {state.isLoading ? (
            <div style={{ padding: 16 }}>Loading tasks...</div>
          ) : state.error ? (
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 8 }}>Error: {state.error}</div>
              <button type="button" onClick={actions.loadFromApi}>
                Retry
              </button>
            </div>
          ) : (
            <Board
              columns={derived.byColumn}
              counts={derived.counts}
              onAddTask={openNewTask}
              onDeleteTask={handleDeleteTask}
            />
          )}
        </div>
      </main>

      {isNewTaskOpen && (
        <NewTaskModal
          sortMode={state.sortMode}
          initialColumnId={presetColumnId}
          onClose={closeNewTask}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}