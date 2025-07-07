import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/services/tache";

interface SortableItemProps {
  id: string;
  task: Task;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, task }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-4 rounded-lg shadow-sm mb-4 bg-white dark:bg-gray-600 dark:text-white cursor-grab"
    >
      <h3 className="font-bold text-lg mb-2">{task.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
    </div>
  );
};
