import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task, Category, ActivityLog, EarnedRewards, RewardType } from '@/types/task';
import { ICONS_LIST, COLORS_LIST } from '@/types/task';

interface RewardCardProps {
  type: RewardType;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

const RewardCard = ({ type, label, value, onChange }: RewardCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleBlur = () => {
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-4 text-center hover:shadow-md transition-all">
      <div className="flex flex-col items-center gap-2">
        {isEditing ? (
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-2xl font-bold text-center h-10 w-20"
          />
        ) : (
          <div
            className="text-2xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
            onClick={() => {
              setIsEditing(true);
              setInputValue(value.toString());
            }}
          >
            {value}
          </div>
        )}
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange(value - 1)}
          >
            <Icon name="Minus" size={14} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChange(value + 1)}
          >
            <Icon name="Plus" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

interface CategoriesRewardsViewProps {
  viewType: 'categories' | 'rewards' | 'history';
  tasks: Task[];
  categories: Category[];
  activityLog: ActivityLog[];
  earnedRewards: EarnedRewards;
  isCategoryDialogOpen: boolean;
  setIsCategoryDialogOpen: (open: boolean) => void;
  isRewardDialogOpen: boolean;
  setIsRewardDialogOpen: (open: boolean) => void;
  newCategory: {
    name: string;
    icon: string;
    color: string;
  };
  setNewCategory: (category: any) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  manualRewards: {
    points: number;
    minutes: number;
    rubles: number;
  };
  setManualRewards: (rewards: any) => void;
  handleCreateCategory: () => void;
  handleEditCategory: (category: Category) => void;
  handleUpdateCategory: () => void;
  handleDeleteCategory: (id: string) => void;
  handleAddManualReward: () => void;
  handleUndoAction: (logId: string) => void;
  setEarnedRewards?: (rewards: EarnedRewards | ((prev: EarnedRewards) => EarnedRewards)) => void;
  addActivityLog?: (action: string, description: string, undoData?: any) => void;
}

export const CategoriesRewardsView = (props: CategoriesRewardsViewProps) => {
  const {
    viewType,
    tasks,
    categories,
    activityLog,
    earnedRewards,
    isCategoryDialogOpen,
    setIsCategoryDialogOpen,
    isRewardDialogOpen,
    setIsRewardDialogOpen,
    newCategory,
    setNewCategory,
    editingCategory,
    setEditingCategory,
    manualRewards,
    setManualRewards,
    handleCreateCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleAddManualReward,
  } = props;

  if (viewType === 'categories') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Категории</h2>
          <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
            setIsCategoryDialogOpen(open);
            if (!open) {
              setEditingCategory(null);
              setNewCategory({ name: '', icon: 'Star', color: 'bg-blue-500' });
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Icon name="Plus" size={16} />
                Новая категория
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Название</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Название категории"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Иконка</label>
                  <div className="grid grid-cols-8 gap-2">
                    {ICONS_LIST.map(icon => (
                      <Button
                        key={icon}
                        variant={newCategory.icon === icon ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setNewCategory({ ...newCategory, icon })}
                      >
                        <Icon name={icon} size={16} />
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Цвет</label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS_LIST.map(color => (
                      <button
                        key={color}
                        className={`${color} h-10 rounded-md ${newCategory.color === color ? 'ring-2 ring-foreground' : ''}`}
                        onClick={() => setNewCategory({ ...newCategory, color })}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={editingCategory ? handleUpdateCategory : handleCreateCategory} className="w-full">
                  {editingCategory ? 'Обновить' : 'Создать'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-3 grid-cols-2">
          {categories.map(category => (
            <Card key={category.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`${category.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                    <Icon name={category.icon} size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {tasks.filter(t => t.category === category.id).length} задач
              </p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (viewType === 'rewards') {
    const [editingReward, setEditingReward] = useState<RewardType | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleRewardClick = (type: RewardType, currentValue: number) => {
      setEditingReward(type);
      setEditValue(currentValue.toString());
    };

    const handleRewardSave = (type: RewardType) => {
      const numValue = parseInt(editValue);
      if (!isNaN(numValue)) {
        const rewardLabels = { points: 'баллов', minutes: 'минут', rubles: 'рублей' };
        props.setEarnedRewards?.((prev: EarnedRewards) => {
          const oldValue = prev[type];
          const diff = numValue - oldValue;
          const sign = diff >= 0 ? '+' : '';
          props.addActivityLog?.(
            'Изменение наград',
            `${rewardLabels[type]}: ${oldValue} → ${numValue} (${sign}${diff})`,
            { type: 'reward_change', data: { rewardType: type, previousValue: oldValue, newValue: numValue } }
          );
          return { ...prev, [type]: numValue };
        });
      }
      setEditingReward(null);
    };

    const handleRewardKeyDown = (e: React.KeyboardEvent, type: RewardType) => {
      if (e.key === 'Enter') {
        handleRewardSave(type);
      } else if (e.key === 'Escape') {
        setEditingReward(null);
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Награды</h2>
          <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Icon name="Plus" size={16} />
                Добавить награды
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Добавить награды вручную</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {(['points', 'minutes', 'rubles'] as RewardType[]).map((type) => {
                    const labels = { points: 'Баллы', minutes: 'Минуты', rubles: 'Рубли' };
                    const rewardLabels = { points: 'баллов', minutes: 'минут', rubles: 'рублей' };
                    return (
                      <RewardCard
                        key={type}
                        type={type}
                        label={labels[type]}
                        value={earnedRewards[type]}
                        onChange={(newValue) => {
                          props.setEarnedRewards?.((prev: EarnedRewards) => {
                            const oldValue = prev[type];
                            const diff = newValue - oldValue;
                            const sign = diff >= 0 ? '+' : '';
                            props.addActivityLog?.(
                              'Изменение наград',
                              `${rewardLabels[type]}: ${oldValue} → ${newValue} (${sign}${diff})`,
                              { type: 'reward_change', data: { rewardType: type, previousValue: oldValue, newValue: newValue } }
                            );
                            return { ...prev, [type]: newValue };
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid gap-4 grid-cols-3 mb-6">
          {earnedRewards.points !== 0 && (
            <Card className="p-6 text-center hover:shadow-lg transition-all">
              <Icon name="Star" size={32} className="mx-auto mb-2 text-yellow-500" />
              {editingReward === 'points' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleRewardSave('points')}
                  onKeyDown={(e) => handleRewardKeyDown(e, 'points')}
                  autoFocus
                  className="text-3xl font-bold text-center h-14 mb-2"
                />
              ) : (
                <p 
                  className="text-3xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors mb-2"
                  onClick={() => handleRewardClick('points', earnedRewards.points)}
                >
                  {earnedRewards.points}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Баллов заработано</p>
            </Card>
          )}
          {earnedRewards.minutes !== 0 && (
            <Card className="p-6 text-center hover:shadow-lg transition-all">
              <Icon name="Clock" size={32} className="mx-auto mb-2 text-blue-500" />
              {editingReward === 'minutes' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleRewardSave('minutes')}
                  onKeyDown={(e) => handleRewardKeyDown(e, 'minutes')}
                  autoFocus
                  className="text-3xl font-bold text-center h-14 mb-2"
                />
              ) : (
                <p 
                  className="text-3xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors mb-2"
                  onClick={() => handleRewardClick('minutes', earnedRewards.minutes)}
                >
                  {earnedRewards.minutes}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Минут заработано</p>
            </Card>
          )}
          {earnedRewards.rubles !== 0 && (
            <Card className="p-6 text-center hover:shadow-lg transition-all">
              <Icon name="DollarSign" size={32} className="mx-auto mb-2 text-green-500" />
              {editingReward === 'rubles' ? (
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleRewardSave('rubles')}
                  onKeyDown={(e) => handleRewardKeyDown(e, 'rubles')}
                  autoFocus
                  className="text-3xl font-bold text-center h-14 mb-2"
                />
              ) : (
                <p 
                  className="text-3xl font-bold text-foreground cursor-pointer hover:text-primary transition-colors mb-2"
                  onClick={() => handleRewardClick('rubles', earnedRewards.rubles)}
                >
                  {earnedRewards.rubles}
                </p>
              )}
              <p className="text-sm text-muted-foreground">Рублей заработано</p>
            </Card>
          )}
        </div>

        {earnedRewards.points === 0 && earnedRewards.minutes === 0 && earnedRewards.rubles === 0 && (
          <Card className="p-8 text-center">
            <Icon name="Trophy" size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Выполняйте задачи, чтобы зарабатывать награды</p>
          </Card>
        )}
      </div>
    );
  }

  if (viewType === 'history') {
    console.log('Activity log:', activityLog.map(l => ({ id: l.id, action: l.action, hasUndo: !!l.undoData })));
    
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Журнал действий</h2>
        <div className="space-y-2">
          {activityLog.length === 0 ? (
            <Card className="p-8 text-center">
              <Icon name="History" size={48} className="mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">История действий пуста</p>
            </Card>
          ) : (
            activityLog.map(log => (
              <Card key={log.id} className="p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{log.action}</h3>
                    <p className="text-sm text-muted-foreground">{log.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      {format(log.timestamp, 'd MMMM yyyy, HH:mm', { locale: ru })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.undoData && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => props.handleUndoAction(log.id)}
                        title="Отменить действие"
                      >
                        <Icon name="Undo2" size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default CategoriesRewardsView;