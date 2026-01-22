import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import type { Task, Section } from '@/types/task';

interface SortableSectionRenderProps {
  dragHandleProps: any;
}

interface SortableSectionProps {
  section: Section;
  children: (props: SortableSectionRenderProps) => React.ReactNode;
}

export const SortableSection = ({ section, children }: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="section-transition"
    >
      {children({ dragHandleProps })}
    </div>
  );
};

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
}

export const DroppableArea = ({ id, children }: DroppableAreaProps) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
};

interface SortableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SortableTask = ({ task, onEdit, onComplete, onDelete }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      {...listeners}
      className="p-3 hover:shadow-md transition-all cursor-grab active:cursor-grabbing task-card"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{task.title}</h4>
            <Badge variant="outline" className="text-xs">
              P{task.priority || 2}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {task.rewardType === 'points' ? '⭐' : task.rewardType === 'minutes' ? '⏱️' : '💰'} {task.rewardAmount}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}>
                <Icon name="Check" size={14} />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};