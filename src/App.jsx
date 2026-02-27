
// src/App.jsx
import { useEffect, useRef, useState } from "react";
import TopBar from "./components/TopBar/TopBar";
import Board from "./components/Board/Board";
import { useKanbanStore } from "./store/useKanbanStore";
import NewTaskModal from "./components/Modals/NewTaskModal";
import { tasksToCsv, downloadCsv, parseTasksCsvFile } from "./utils/csv";

export default function App() {
  const { state, derived, actions } = useKanbanStore();

  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [presetColumnId, setPresetColumnId] = useState(null);

  // hidden file input for Import CSV
  const fileInputRef = useRef(null);

  // ✅ load tasks from backend on first render
  useEffect(() => {
    actions.loadFromApi();
  }, [actions]);

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
      await actions.createTask(input); // POST към backend + update UI
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

  // ✅ EXPORT CSV (frontend only)
  function handleExportCsv() {
    try {
      const csv = tasksToCsv(state.tasks);
      const stamp = new Date().toISOString().slice(0, 19).replaceAll(":", "-");
      downloadCsv(csv, `kanban-tasks-${stamp}.csv`);
    } catch (e) {
      alert(e?.message ?? "Failed to export CSV");
    }
  }

  // ✅ IMPORT CSV: open file picker
  function handleImportCsvClick() {
    fileInputRef.current?.click();
  }

  // ✅ IMPORT CSV: file selected
  async function handleImportFileChange(e) {
    const file = e.target.files?.[0];
    // reset input so selecting the same file again still fires onChange
    e.target.value = "";
    if (!file) return;

    try {
      const importedTasks = await parseTasksCsvFile(file);

      const replace = confirm(
        `CSV contains ${importedTasks.length} tasks.\n\nOK = Replace ALL existing tasks\nCancel = Append tasks`
      );

      if (replace) {
        await actions.deleteAllFromApi();
      }

      // Create each task through existing POST logic
      for (const t of importedTasks) {
        await actions.createTask(t);
      }

      // Final sync from API
      await actions.loadFromApi();
      alert("Import complete ✅");
    } catch (err) {
      alert(err?.message ?? "Import failed");
    }
  }

  return (
    <div className="appShell">
      {/* hidden file input for Import CSV */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={handleImportFileChange}
      />

      <TopBar
        sortMode={state.sortMode}
        onDeleteAll={handleDeleteAll} // ✅ delete from DB + UI
        onToggleSort={actions.toggleSortMode}
        onNewTask={() => openNewTask(null)}
        onExport={handleExportCsv}
        onImport={handleImportCsvClick}
      />

      <div className="topDivider" />

      <main className="boardArea">
        <div className="leftRail">
          <button className="iconBtn" onClick={actions.toggleSortMode} title="Filter / Sort">
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
