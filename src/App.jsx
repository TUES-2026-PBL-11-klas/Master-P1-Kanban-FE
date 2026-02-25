import { useState } from "react";
import TopBar from "./components/TopBar/TopBar";
import Board from "./components/Board/Board";
import { useKanbanStore } from "./store/useKanbanStore";
import NewTaskModal from "./components/Modals/NewTaskModal";

export default function App() {
  const { state, derived, actions } = useKanbanStore();
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  // коя колона е избрана от плюсчето (ако е null -> от горния бутон)
  const [presetColumnId, setPresetColumnId] = useState(null);

  function openNewTask(columnId = null) {
    setPresetColumnId(columnId);
    setIsNewTaskOpen(true);
  }

  function closeNewTask() {
    setIsNewTaskOpen(false);
    setPresetColumnId(null);
  }

  return (
    <div className="appShell">
      <TopBar
        sortMode={state.sortMode}
        onDeleteAll={actions.deleteAll}
        onToggleSort={actions.toggleSortMode}
        onNewTask={() => openNewTask(null)}
        onExport={() => alert("Export CSV idva sledvashtata stupka ")}
        onImport={() => alert("Import CSV idva sledvashtata stupka ")}
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
          <Board
            columns={derived.byColumn}
            counts={derived.counts}
            onAddTask={openNewTask}
          />
        </div>
      </main>

      {isNewTaskOpen && (
        <NewTaskModal
          sortMode={state.sortMode}
          initialColumnId={presetColumnId}
          onClose={closeNewTask}
          onCreate={(input) => actions.createTask(input)}
        />
      )}
    </div>
  );
}