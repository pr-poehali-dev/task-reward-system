import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type RewardType = 'points' | 'minutes' | 'rubles';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardType: RewardType;
  rewardAmount: number;
  completed: boolean;
  createdAt: Date;
}

const categories = [
  { id: 'work', name: 'Работа', icon: 'Briefcase', color: 'bg-blue-500' },
  { id: 'personal', name: 'Личное', icon: 'User', color: 'bg-green-500' },
  { id: 'health', name: 'Здоровье', icon: 'Heart', color: 'bg-red-500' },
  { id: 'learning', name: 'Обучение', icon: 'BookOpen', color: 'bg-purple-500' },
  { id: 'home', name: 'Дом', icon: 'Home', color: 'bg-orange-500' },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'work',
    rewardType: 'points' as RewardType,
    rewardAmount: 10,
  });

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
    };

    setTasks([...tasks, task]);
    setIsDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      category: 'work',
      rewardType: 'points',
      rewardAmount: 10,
    });
    toast.success('Задача создана!');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && !task.completed) {
        const rewardText = task.rewardType === 'points' ? 'баллов' : task.rewardType === 'minutes' ? 'минут' : 'рублей';
        toast.success(`Получено ${task.rewardAmount} ${rewardText}!`, {
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

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : activeTab === 'active'
    ? tasks.filter(t => !t.completed)
    : tasks.filter(t => t.completed);

  const totalRewards = {
    points: tasks.filter(t => t.completed && t.rewardType === 'points').reduce((sum, t) => sum + t.rewardAmount, 0),
    minutes: tasks.filter(t => t.completed && t.rewardType === 'minutes').reduce((sum, t) => sum + t.rewardAmount, 0),
    rubles: tasks.filter(t => t.completed && t.rewardType === 'rubles').reduce((sum, t) => sum + t.rewardAmount, 0),
  };

  const completionRate = tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Задачник</h1>
              <p className="text-muted-foreground">Выполняй задачи, получай награды</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up">
            <Card className="p-6">
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
            <Card className="p-6">
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
            <Card className="p-6">
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
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Прогресс</p>
                  <p className="text-3xl font-bold">{Math.round(completionRate)}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-orange-500" />
                </div>
              </div>
              <Progress value={completionRate} className="h-2" />
            </Card>
          </div>
        </header>

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
                  <Card key={task.id} className={`p-6 transition-all hover:shadow-lg ${task.completed ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-lg ${category?.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon name={category?.icon as any} size={20} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-lg font-semibold ${task.completed ? 'line-through' : ''}`}>
                              {task.title}
                            </h3>
                            <Badge variant="secondary" className="gap-1">
                              <Icon name={rewardIcon as any} size={12} />
                              {task.rewardAmount} {rewardText}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon name="Tag" size={12} />
                            {category?.name}
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
