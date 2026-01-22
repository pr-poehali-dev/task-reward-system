import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icon from '@/components/ui/icon';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTask, DroppableArea } from './SortableComponents';
import type { Task, Category, Section, RewardType, Project } from '@/types/task';

interface SectionCardProps {
  section: Section;
  sectionTasks: Task[];
  categories: Category[];
  projects: Project[];
  currentProjectId: string;
  isOver?: boolean;
  addingToSection: string | null;
  newTask: {
    title: string;
    description: string;
    category: string;
    rewardType: RewardType;
    rewardAmount: number;
    sectionId: string;
  };
  onDeleteSection: (id: string) => void;
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (sectionId: string) => void;
  onCancelAdd: () => void;
  onNewTaskChange: (field: string, value: any) => void;
  onCreateTask: (sectionId: string) => void;
  onMoveSection: (sectionId: string, targetProjectId: string) => void;
}

const SectionCard = ({
  section,
  sectionTasks,
  categories,
  projects,
  currentProjectId,
  isOver,
  addingToSection,
  newTask,
  onDeleteSection,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onAddTask,
  onCancelAdd,
  onNewTaskChange,
  onCreateTask,
  onMoveSection,
}: SectionCardProps) => {
  const otherProjects = projects.filter(p => p.id !== currentProjectId);
  return (
    <Card className={`flex-shrink-0 w-80 p-4 flex flex-col section-card-content transition-all ${isOver ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{section.name}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{sectionTasks.length}</Badge>
          {otherProjects.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Icon name="FolderInput" size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {otherProjects.map(project => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => onMoveSection(section.id, project.id)}
                  >
                    <Icon name={project.icon as any} size={16} className="mr-2" />
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onDeleteSection(section.id)}
          >
            <Icon name="Trash2" size={14} />
          </Button>
        </div>
      </div>

      <DroppableArea id={`droppable-${section.id}`}>
        <div className="space-y-2 min-h-[100px] overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 350px)' }}>
          <SortableContext items={sectionTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {sectionTasks.map(task => (
              <SortableTask
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onComplete={onCompleteTask}
                onDelete={onDeleteTask}
              />
            ))}
          </SortableContext>
        </div>
      </DroppableArea>

      {addingToSection === section.id ? (
        <Card className="p-3 mt-2 space-y-2">
          <Input
            placeholder="Название задачи"
            value={newTask.title}
            onChange={(e) => onNewTaskChange('title', e.target.value)}
          />
          <Textarea
            placeholder="Описание"
            value={newTask.description}
            onChange={(e) => onNewTaskChange('description', e.target.value)}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={newTask.category} onValueChange={(v) => onNewTaskChange('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newTask.rewardType} onValueChange={(v) => onNewTaskChange('rewardType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Награда" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">⭐ Баллы</SelectItem>
                <SelectItem value="minutes">⏱️ Минуты</SelectItem>
                <SelectItem value="money">💰 Деньги</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input
            type="number"
            placeholder="Сумма"
            value={newTask.rewardAmount}
            onChange={(e) => onNewTaskChange('rewardAmount', Number(e.target.value))}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onCreateTask(section.id)} disabled={!newTask.title.trim()}>
              Создать
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelAdd}>
              Отмена
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => onAddTask(section.id)}
        >
          <Icon name="Plus" size={14} className="mr-2" />
          Добавить задачу
        </Button>
      )}
    </Card>
  );
};

export default SectionCard;