import React, { useState, useEffect } from "react";
import { DragDropContext} from "react-beautiful-dnd";
import { getIssues, updateIssue } from "./api";
import AppDraggable from "./AppDraggable";

const initColums = {
  openCol: {
    name: "Open",
    items: []
  },
  closeCol: {
    name: "Close",
    items: []
  }
};

function App() {
  const [columns, setColumns] = useState(initColums);

  useEffect(() => {
    getIssuesInfo();
  }, []);

  const getIssuesInfo = () => {
    getIssues("Zyglyuk", "sun-06-repo").then(response => {
      if(response.status === 200) {        
        let columnsCopy = JSON.parse(JSON.stringify(initColums))
        response.data.forEach(issue => {
          if (issue.state === 'open') {
            columnsCopy.openCol.items.push({ id: issue.number.toString(), content: issue.title })
          } else if (issue.state === 'closed') {
            columnsCopy.closeCol.items.push({ id: issue.number.toString(), content: issue.title })
          }
        })
        setColumns(columnsCopy);
      }
    })
  }

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems
        }
      });
      updateIssue("Zyglyuk", "sun-06-repo", removed.id, destColumn.name).then(response => {
        if (response.status === 200) {
          getIssuesInfo();
        }
      })
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems
        }
      });
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", height: "100%" }}>
      <DragDropContext
        onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
      >
        {Object.entries(columns).map(([columnId, column], index) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
              key={columnId}
            >
              <h2>{column.name}</h2>
              <div style={{ margin: 8 }}>
                <AppDraggable items={column.items} columnId={columnId} />
              </div>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}


export default App