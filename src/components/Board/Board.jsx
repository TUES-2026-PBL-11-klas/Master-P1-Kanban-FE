// src/components/Board/Board.jsx
import Column from "./Column";
import styles from "./Board.module.css";

export default function Board({ columns, counts, onAddTask, onDeleteTask, onMoveTask }) {
  return (
    <>
      <Column
        columnId="todo"
        title={`To do (${counts.todo})`}
        tasks={columns.todo}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
        onMoveTask={onMoveTask} // ✅ NEW
      />

      <Column
        columnId="inprogress"
        title={`In progress (${counts.inprogress})`}
        tasks={columns.inprogress}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
        onMoveTask={onMoveTask} // ✅ NEW
      />

      <Column
        columnId="done"
        title={`Done (${counts.done})`}
        tasks={columns.done}
        onAddTask={onAddTask}
        onDeleteTask={onDeleteTask}
        onMoveTask={onMoveTask} // ✅ NEW
      />
    </>
  );
}
