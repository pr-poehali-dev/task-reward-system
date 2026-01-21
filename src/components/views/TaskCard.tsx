import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task, Category, Project } from '@/types/task';

interface TaskCardProps {
  task: Task;
  showProject?: boolean;
  projects: Project[];
  getCategoryById: (id: string) => Category | undefined;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  handleUncompleteTask?: (id: string) => void;
}

export const TaskCard = ({
  task,
  showProject = false,
  projects,
  getCategoryById,
  handleCompleteTask,
  handleDeleteTask,
  handleUncompleteTask,
}: TaskCardProps) => {
  const category = getCategoryById(task.category);
  const project = projects.find(p => p.id === task.projectId);
  const section = project?.sections.find(s => s.id === task.sectionId);

  return (
    <Card key={task.id} className="p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {category && (
              <Badge variant="secondary" className={`${category.color} text-white gap-1`}>
                <Icon name={category.icon} size={14} />
                {category.name}
              </Badge>
            )}
            {showProject && project && (
              <Badge variant="outline" className="gap-1">
                <Icon name={project.icon} size={14} />
                {project.name}
              </Badge>
            )}
            {section && (
              <Badge variant="outline" className="text-xs">{section.name}</Badge>
            )}
          </div>
          <h3 className={`font-semibold mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {task.scheduledDate && (
              <span className="flex items-center gap-1">
                <Icon name="Calendar" size={14} />
                {format(task.scheduledDate, 'd MMM', { locale: ru })}
              </span>
            )}
            <Badge variant="outline" className="gap-1">
              <Icon name={task.rewardType === 'points' ? 'Star' : task.rewardType === 'minutes' ? 'Clock' : 'DollarSign'} size={14} />
              {task.rewardAmount} {task.rewardType === 'points' ? 'баллов' : task.rewardType === 'minutes' ? 'мин' : '₽'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {!task.completed ? (
            <Button
              size="sm"
              onClick={() => handleCompleteTask(task.id)}
              className="gap-1"
            >
              <Icon name="Check" size={16} />
            </Button>
          ) : handleUncompleteTask ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUncompleteTask(task.id)}
              className="gap-1"
            >
              <Icon name="RotateCcw" size={16} />
              Вернуть
            </Button>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Icon name="Check" size={14} />
              Готово
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteTask(task.id)}
          >
            <Icon name="Trash2" size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;