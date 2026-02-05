import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Icon from '@/components/ui/icon';
import { SortableTask, DroppableArea } from './SortableComponents';
import type { Task, Category, RewardType } from '@/types/task';

interface NoSectionTasksCardProps {
  noSectionTasks: Task[];
  addingToSection: string | null;
  newTask: {
    title: string;
    description: string;
    category: string;
    priority: number;
    rewardType: RewardType;
    rewardAmount: number;
    sectionId: string;
  };
  categories: Category[];
  onEditTask: (task: Task) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (sectionId: string) => void;
  onCancelAdd: () => void;
  onNewTaskChange: (task: any) => void;
  onCreateTask: (sectionId: string) => void;
}

const NoSectionTasksCard = ({
  noSectionTasks,
  addingToSection,
  newTask,
  categories,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onAddTask,
  onCancelAdd,
  onNewTaskChange,
  onCreateTask,
}: NoSectionTasksCardProps) => {
  if (noSectionTasks.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Без раздела</h3>
        <Badge variant="outline">{noSectionTasks.length}</Badge>
      </div>

      <DroppableArea id="droppable-none">
        <div className="space-y-2">
          <SortableContext items={noSectionTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {noSectionTasks.map(task => (
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

      {addingToSection === 'none' ? (
        <Card className="p-3 mt-2 space-y-2">
          <Input
            placeholder="Название задачи"
            value={newTask.title}
            onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
          />
          <Textarea
            placeholder="Описание"
            value={newTask.description}
            onChange={(e) => onNewTaskChange({ ...newTask, description: e.target.value })}
            rows={2}
          />
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium mb-1 block">Приоритет</label>
              <Select value={String(newTask.priority)} onValueChange={(v) => onNewTaskChange({ ...newTask, priority: Number(v) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">🔴 Высокий</SelectItem>
                  <SelectItem value="2">🟡 Средний</SelectItem>
                  <SelectItem value="3">🔵 Низкий</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">Категория</label>
                <Select value={newTask.category} onValueChange={(v) => onNewTaskChange({ ...newTask, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Награда</label>
                <Select value={newTask.rewardType} onValueChange={(v) => onNewTaskChange({ ...newTask, rewardType: v as RewardType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">⭐ Баллы</SelectItem>
                    <SelectItem value="minutes">⏱️ Минуты</SelectItem>
                    <SelectItem value="money">💰 Деньги</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Input
            type="number"
            placeholder="Сумма"
            value={newTask.rewardAmount}
            onChange={(e) => onNewTaskChange({ ...newTask, rewardAmount: Number(e.target.value) })}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onCreateTask('none')} disabled={!newTask.title.trim()}>Создать</Button>
            <Button size="sm" variant="outline" onClick={onCancelAdd}>Отмена</Button>
          </div>
        </Card>
      ) : (
        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => onAddTask('none')}>
          <Icon name="Plus" size={14} className="mr-2" />
          Добавить задачу
        </Button>
      )}
    </Card>
  );
};

export default NoSectionTasksCard;