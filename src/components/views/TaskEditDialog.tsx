import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task, Category, RewardType } from '@/types/task';

interface TaskEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editForm: Partial<Task>;
  categories: Category[];
  onFormChange: (field: string, value: any) => void;
  onSave: () => void;
}

const TaskEditDialog = ({
  isOpen,
  onOpenChange,
  editForm,
  categories,
  onFormChange,
  onSave,
}: TaskEditDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактировать задачу</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Название</label>
            <Input
              value={editForm.title || ''}
              onChange={(e) => onFormChange('title', e.target.value)}
              placeholder="Название задачи"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={editForm.description || ''}
              onChange={(e) => onFormChange('description', e.target.value)}
              placeholder="Описание задачи"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Приоритет</label>
            <Select value={String(editForm.priority || 2)} onValueChange={(v) => onFormChange('priority', Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">P1 - Высокий</SelectItem>
                <SelectItem value="2">P2 - Средний</SelectItem>
                <SelectItem value="3">P3 - Низкий</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Тип награды</label>
              <Select value={editForm.rewardType} onValueChange={(v) => onFormChange('rewardType', v as RewardType)}>
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
            <div>
              <label className="text-sm font-medium">Сумма награды</label>
              <Input
                type="number"
                value={editForm.rewardAmount || 0}
                onChange={(e) => onFormChange('rewardAmount', Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Дедлайн</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Icon name="Calendar" size={16} className="mr-2" />
                  {editForm.deadline ? format(new Date(editForm.deadline), 'PPP', { locale: ru }) : 'Выберите дату'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={editForm.deadline ? new Date(editForm.deadline) : undefined}
                  onSelect={(date) => onFormChange('deadline', date?.toISOString())}
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={onSave}>Сохранить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditDialog;