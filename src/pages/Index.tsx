import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

type RewardType = 'points' | 'minutes' | 'rubles';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardType: RewardType;
  rewardAmount: number;
  completed: boolean;
  createdAt: Date;
  scheduledDate?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: number;
  color: string;
}

const LEVEL_THRESHOLD = 100;
const ICONS_LIST = ['Star', 'Heart', 'Zap', 'Trophy', 'Target', 'Award', 'Flag', 'Rocket', 'Crown', 'Gift', 'Sparkles', 'Coffee', 'BookOpen', 'Code', 'Music', 'Camera', 'Palette', 'Briefcase', 'Home', 'User'];
const COLORS_LIST = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500'];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'work', name: 'Работа', icon: 'Briefcase', color: 'bg-blue-500' },
    { id: 'personal', name: 'Личное', icon: 'User', color: 'bg-green-500' },
    { id: 'health', name: 'Здоровье', icon: 'Heart', color: 'bg-red-500' },
    { id: 'learning', name: 'Обучение', icon: 'BookOpen', color: 'bg-purple-500' },
    { id: 'home', name: 'Дом', icon: 'Home', color: 'bg-orange-500' },
  ]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', title: 'Первые шаги', description: 'Выполните первую задачу', icon: 'Star', unlocked: false, requirement: 1, color: 'bg-yellow-500' },
    { id: '2', title: 'Трудяга', description: 'Выполните 10 задач', icon: 'Zap', unlocked: false, requirement: 10, color: 'bg-orange-500' },
    { id: '3', title: 'Профессионал', description: 'Выполните 50 задач', icon: 'Trophy', unlocked: false, requirement: 50, color: 'bg-purple-500' },
    { id: '4', title: 'Магистр', description: 'Достигните 10 уровня', icon: 'Crown', unlocked: false, requirement: 10, color: 'bg-blue-500' },
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'work',
    rewardType: 'points' as RewardType,
    rewardAmount: 10,
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Star',
    color: 'bg-blue-500',
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [manualRewards, setManualRewards] = useState({
    points: 0,
    minutes: 0,
    rubles: 0,
  });

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalExperience = completedTasksCount * 20;
  const currentLevel = Math.floor(totalExperience / LEVEL_THRESHOLD) + 1;
  const experienceInLevel = totalExperience % LEVEL_THRESHOLD;
  const experienceForNextLevel = LEVEL_THRESHOLD;

  useEffect(() => {
    const newAchievements = achievements.map(ach => {
      if (ach.id === '1' && completedTasksCount >= 1 && !ach.unlocked) {
        toast.success('🏆 Достижение разблокировано!', { description: ach.title });
        return { ...ach, unlocked: true };
      }
      if (ach.id === '2' && completedTasksCount >= 10 && !ach.unlocked) {
        toast.success('🏆 Достижение разблокировано!', { description: ach.title });
        return { ...ach, unlocked: true };
      }
      if (ach.id === '3' && completedTasksCount >= 50 && !ach.unlocked) {
        toast.success('🏆 Достижение разблокировано!', { description: ach.title });
        return { ...ach, unlocked: true };
      }
      if (ach.id === '4' && currentLevel >= 10 && !ach.unlocked) {
        toast.success('🏆 Достижение разблокировано!', { description: ach.title });
        return { ...ach, unlocked: true };
      }
      return ach;
    });
    setAchievements(newAchievements);
  }, [completedTasksCount, currentLevel]);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      toast.error('Введите название задачи');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      completed: false,
      createdAt: new Date(),
      scheduledDate: selectedDate,
    };

    setTasks([...tasks, task]);
    setIsTaskDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      category: categories[0]?.id || 'work',
      rewardType: 'points',
      rewardAmount: 10,
    });
    setSelectedDate(new Date());
    toast.success('Задача создана!');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && !task.completed) {
        const rewardText = task.rewardType === 'points' ? 'баллов' : task.rewardType === 'minutes' ? 'минут' : 'рублей';
        const prevLevel = currentLevel;
        setTimeout(() => {
          const newLevel = Math.floor(((completedTasksCount + 1) * 20) / LEVEL_THRESHOLD) + 1;
          if (newLevel > prevLevel) {
            toast.success(`🎉 Уровень ${newLevel}!`, { description: 'Поздравляем с повышением!' });
          }
        }, 500);
        toast.success(`+${task.rewardAmount} ${rewardText} | +20 XP`, {
          description: task.title,
        });
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success('Задача удалена');
  };

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      toast.error('Введите название категории');
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      ...newCategory,
    };

    setCategories([...categories, category]);
    setIsCategoryDialogOpen(false);
    setNewCategory({
      name: '',
      icon: 'Star',
      color: 'bg-blue-500',
    });
    toast.success('Категория создана!');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setIsCategoryDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name.trim()) return;

    setCategories(categories.map(cat => 
      cat.id === editingCategory.id 
        ? { ...cat, name: newCategory.name, icon: newCategory.icon, color: newCategory.color }
        : cat
    ));
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      icon: 'Star',
      color: 'bg-blue-500',
    });
    toast.success('Категория обновлена!');
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    toast.success('Категория удалена');
  };

  const handleAdjustRewards = () => {
    setIsRewardDialogOpen(false);
    toast.success('Награды обновлены!');
  };

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : activeTab === 'active'
    ? tasks.filter(t => !t.completed)
    : tasks.filter(t => t.completed);

  const totalRewards = {
    points: tasks.filter(t => t.completed && t.rewardType === 'points').reduce((sum, t) => sum + t.rewardAmount, 0) + manualRewards.points,
    minutes: tasks.filter(t => t.completed && t.rewardType === 'minutes').reduce((sum, t) => sum + t.rewardAmount, 0) + manualRewards.minutes,
    rubles: tasks.filter(t => t.completed && t.rewardType === 'rubles').reduce((sum, t) => sum + t.rewardAmount, 0) + manualRewards.rubles,
  };

  const tasksForSelectedDate = tasks.filter(task => 
    task.scheduledDate && selectedDate && isSameDay(task.scheduledDate, selectedDate)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Задачник Pro</h1>
              <p className="text-muted-foreground">Выполняй задачи, прокачивайся, достигай целей</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="gap-2">
                    <Icon name="Calendar" size={20} />
                    Календарь
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Планирование задач</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ru}
                      className="rounded-md border"
                    />
                    {selectedDate && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          Задачи на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                        </h3>
                        {tasksForSelectedDate.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Нет задач на этот день</p>
                        ) : (
                          <div className="space-y-2">
                            {tasksForSelectedDate.map(task => (
                              <Card key={task.id} className="p-3">
                                <div className="flex items-center gap-2">
                                  {task.completed ? (
                                    <Icon name="CheckCircle2" size={16} className="text-green-500" />
                                  ) : (
                                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                                  )}
                                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                    {task.title}
                                  </span>
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="gap-2">
                    <Icon name="Plus" size={20} />
                    Новая задача
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Создать задачу</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Название</label>
                      <Input
                        placeholder="Введите название задачи"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Описание</label>
                      <Textarea
                        placeholder="Опишите задачу (необязательно)"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Категория</label>
                      <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex items-center gap-2">
                                <Icon name={cat.icon as any} size={16} />
                                {cat.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Запланировать на дату</label>
                      <div className="text-sm text-muted-foreground">
                        {selectedDate ? format(selectedDate, 'd MMMM yyyy', { locale: ru }) : 'Не выбрано'}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Тип награды</label>
                        <Select value={newTask.rewardType} onValueChange={(value: RewardType) => setNewTask({ ...newTask, rewardType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="points">Баллы</SelectItem>
                            <SelectItem value="minutes">Минуты</SelectItem>
                            <SelectItem value="rubles">Рубли</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Количество</label>
                        <Input
                          type="number"
                          min="1"
                          value={newTask.rewardAmount}
                          onChange={(e) => setNewTask({ ...newTask, rewardAmount: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <Button onClick={handleCreateTask} className="w-full">
                      Создать задачу
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 animate-slide-up">
            <Card className="p-6 hover-scale cursor-pointer" onClick={() => setIsRewardDialogOpen(true)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Баллы</p>
                  <p className="text-3xl font-bold text-primary">{totalRewards.points}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Star" size={24} className="text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-6 hover-scale cursor-pointer" onClick={() => setIsRewardDialogOpen(true)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Минуты</p>
                  <p className="text-3xl font-bold text-blue-500">{totalRewards.minutes}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Icon name="Clock" size={24} className="text-blue-500" />
                </div>
              </div>
            </Card>
            <Card className="p-6 hover-scale cursor-pointer" onClick={() => setIsRewardDialogOpen(true)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Рубли</p>
                  <p className="text-3xl font-bold text-green-500">{totalRewards.rubles}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icon name="DollarSign" size={24} className="text-green-500" />
                </div>
              </div>
            </Card>
            <Card className="p-6 col-span-1 lg:col-span-2 bg-gradient-to-r from-primary/10 to-purple-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-pulse">
                    <Icon name="Sparkles" size={24} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Уровень</p>
                    <p className="text-3xl font-bold">{currentLevel}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Опыт</p>
                  <p className="text-sm font-semibold">{experienceInLevel} / {experienceForNextLevel}</p>
                </div>
              </div>
              <Progress value={(experienceInLevel / experienceForNextLevel) * 100} className="h-3" />
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="Trophy" size={20} />
                  Достижения
                </h3>
                <Badge variant="secondary">{achievements.filter(a => a.unlocked).length}/{achievements.length}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map(ach => (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      ach.unlocked 
                        ? `${ach.color} border-transparent animate-scale-in` 
                        : 'bg-muted/50 border-dashed border-muted-foreground/20 opacity-60'
                    }`}
                  >
                    <Icon name={ach.icon as any} size={24} className={ach.unlocked ? 'text-white' : 'text-muted-foreground'} />
                    <p className={`text-xs font-medium mt-2 ${ach.unlocked ? 'text-white' : 'text-muted-foreground'}`}>
                      {ach.title}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Icon name="FolderKanban" size={20} />
                  Категории
                </h3>
                <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
                  setIsCategoryDialogOpen(open);
                  if (!open) {
                    setEditingCategory(null);
                    setNewCategory({ name: '', icon: 'Star', color: 'bg-blue-500' });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icon name="Plus" size={16} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'Редактировать' : 'Создать'} категорию</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Название</label>
                        <Input
                          placeholder="Название категории"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Иконка</label>
                        <Select value={newCategory.icon} onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICONS_LIST.map(icon => (
                              <SelectItem key={icon} value={icon}>
                                <div className="flex items-center gap-2">
                                  <Icon name={icon as any} size={16} />
                                  {icon}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Цвет</label>
                        <div className="grid grid-cols-5 gap-2">
                          {COLORS_LIST.map(color => (
                            <button
                              key={color}
                              className={`w-full h-10 rounded-md ${color} ${newCategory.color === color ? 'ring-2 ring-foreground ring-offset-2' : ''}`}
                              onClick={() => setNewCategory({ ...newCategory, color })}
                            />
                          ))}
                        </div>
                      </div>
                      <Button 
                        onClick={editingCategory ? handleUpdateCategory : handleCreateCategory} 
                        className="w-full"
                      >
                        {editingCategory ? 'Сохранить' : 'Создать'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <div key={cat.id} className="group relative">
                    <Badge 
                      className={`${cat.color} text-white gap-1 pr-8 cursor-pointer hover-scale`}
                      onClick={() => handleEditCategory(cat)}
                    >
                      <Icon name={cat.icon as any} size={14} />
                      {cat.name}
                    </Badge>
                    <button
                      className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id);
                      }}
                    >
                      <Icon name="X" size={12} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </header>

        <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Корректировка наград</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-primary" />
                  Баллы
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, points: manualRewards.points - 10 })}
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={manualRewards.points}
                    onChange={(e) => setManualRewards({ ...manualRewards, points: parseInt(e.target.value) || 0 })}
                    className="text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, points: manualRewards.points + 10 })}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Icon name="Clock" size={16} className="text-blue-500" />
                  Минуты
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, minutes: manualRewards.minutes - 15 })}
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={manualRewards.minutes}
                    onChange={(e) => setManualRewards({ ...manualRewards, minutes: parseInt(e.target.value) || 0 })}
                    className="text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, minutes: manualRewards.minutes + 15 })}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Icon name="DollarSign" size={16} className="text-green-500" />
                  Рубли
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, rubles: manualRewards.rubles - 50 })}
                  >
                    <Icon name="Minus" size={16} />
                  </Button>
                  <Input
                    type="number"
                    value={manualRewards.rubles}
                    onChange={(e) => setManualRewards({ ...manualRewards, rubles: parseInt(e.target.value) || 0 })}
                    className="text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, rubles: manualRewards.rubles + 50 })}
                  >
                    <Icon name="Plus" size={16} />
                  </Button>
                </div>
              </div>
              <Button onClick={handleAdjustRewards} className="w-full">
                Применить
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2">
              <Icon name="List" size={16} />
              Все задачи
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Icon name="CircleDashed" size={16} />
              Активные
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <Icon name="CheckCircle2" size={16} />
              Выполненные
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredTasks.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Icon name="Inbox" size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Нет задач</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' && 'Создайте свою первую задачу'}
                    {activeTab === 'active' && 'Все задачи выполнены!'}
                    {activeTab === 'completed' && 'Пока нет выполненных задач'}
                  </p>
                </div>
              </Card>
            ) : (
              filteredTasks.map((task) => {
                const category = categories.find(c => c.id === task.category);
                const rewardIcon = task.rewardType === 'points' ? 'Star' : task.rewardType === 'minutes' ? 'Clock' : 'DollarSign';
                const rewardText = task.rewardType === 'points' ? 'баллов' : task.rewardType === 'minutes' ? 'мин' : '₽';

                return (
                  <Card key={task.id} className={`p-6 transition-all hover:shadow-lg hover-scale ${task.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${category?.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={category?.icon as any || 'Circle'} size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h3>
                            <Badge variant="secondary" className="gap-1">
                              <Icon name={rewardIcon as any} size={12} />
                              {task.rewardAmount} {rewardText}
                            </Badge>
                            {task.scheduledDate && (
                              <Badge variant="outline" className="gap-1">
                                <Icon name="Calendar" size={12} />
                                {format(task.scheduledDate, 'd MMM', { locale: ru })}
                              </Badge>
                            )}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="Tag" size={12} />
                            {category?.name || 'Без категории'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!task.completed ? (
                          <Button
                            onClick={() => handleCompleteTask(task.id)}
                            size="sm"
                            className="gap-2"
                          >
                            <Icon name="Check" size={16} />
                            Выполнено
                          </Button>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <Icon name="CheckCircle2" size={14} />
                            Готово
                          </Badge>
                        )}
                        <Button
                          onClick={() => handleDeleteTask(task.id)}
                          size="sm"
                          variant="ghost"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
