import Column from "./Column";
import styles from "./Board.module.css";

export default function Board({ columns, counts }) {
  return (
    <>
      <Column
        title={`To do (${counts.todo})`}
        tasks={columns.todo}
      />
      <Column
        title={`In progress (${counts.inprogress})`}
        tasks={columns.inprogress}
      />
      <Column
        title={`Done (${counts.done})`}
        tasks={columns.done}
      />
    </>
  );
}