import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

type RewardType = 'points' | 'minutes' | 'rubles';
type ViewMode = 'list' | 'board';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  subProjects: SubProject[];
}

interface SubProject {
  id: string;
  name: string;
  projectId: string;
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
  projectId: string;
  subProjectId?: string;
}

const ICONS_LIST = ['Star', 'Heart', 'Zap', 'Trophy', 'Target', 'Award', 'Flag', 'Rocket', 'Crown', 'Gift', 'Sparkles', 'Coffee', 'BookOpen', 'Code', 'Music', 'Camera', 'Palette', 'Briefcase', 'Home', 'User', 'Folder', 'FolderOpen', 'Package'];
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

  const [projects, setProjects] = useState<Project[]>([
    { id: 'default', name: 'Главный проект', icon: 'Folder', color: 'bg-blue-500', subProjects: [] },
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState('default');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isSubProjectDialogOpen, setIsSubProjectDialogOpen] = useState(false);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'work',
    rewardType: 'points' as RewardType,
    rewardAmount: 10,
    subProjectId: '',
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: 'Star',
    color: 'bg-blue-500',
  });

  const [newProject, setNewProject] = useState({
    name: '',
    icon: 'Folder',
    color: 'bg-blue-500',
  });

  const [newSubProject, setNewSubProject] = useState({
    name: '',
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [manualRewards, setManualRewards] = useState({
    points: 0,
    minutes: 0,
    rubles: 0,
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

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
      projectId: selectedProjectId,
    };

    setTasks([...tasks, task]);
    setIsTaskDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      category: categories[0]?.id || 'work',
      rewardType: 'points',
      rewardAmount: 10,
      subProjectId: '',
    });
    setSelectedDate(new Date());
    toast.success('Задача создана!');
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId && !task.completed) {
        const rewardText = task.rewardType === 'points' ? 'баллов' : task.rewardType === 'minutes' ? 'минут' : 'рублей';
        toast.success(`+${task.rewardAmount} ${rewardText}`, {
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

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast.error('Введите название проекта');
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      ...newProject,
      subProjects: [],
    };

    setProjects([...projects, project]);
    setIsProjectDialogOpen(false);
    setNewProject({
      name: '',
      icon: 'Folder',
      color: 'bg-blue-500',
    });
    toast.success('Проект создан!');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name,
      icon: project.icon,
      color: project.color,
    });
    setIsProjectDialogOpen(true);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !newProject.name.trim()) return;

    setProjects(projects.map(proj => 
      proj.id === editingProject.id 
        ? { ...proj, name: newProject.name, icon: newProject.icon, color: newProject.color }
        : proj
    ));
    setIsProjectDialogOpen(false);
    setEditingProject(null);
    setNewProject({
      name: '',
      icon: 'Folder',
      color: 'bg-blue-500',
    });
    toast.success('Проект обновлён!');
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length === 1) {
      toast.error('Нельзя удалить последний проект');
      return;
    }
    setProjects(projects.filter(p => p.id !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId(projects[0].id);
    }
    toast.success('Проект удалён');
  };

  const handleCreateSubProject = () => {
    if (!newSubProject.name.trim()) {
      toast.error('Введите название подпроекта');
      return;
    }

    const subProject: SubProject = {
      id: Date.now().toString(),
      name: newSubProject.name,
      projectId: selectedProjectId,
    };

    setProjects(projects.map(proj => 
      proj.id === selectedProjectId
        ? { ...proj, subProjects: [...proj.subProjects, subProject] }
        : proj
    ));
    setIsSubProjectDialogOpen(false);
    setNewSubProject({ name: '' });
    toast.success('Подпроект создан!');
  };

  const handleDeleteSubProject = (subProjectId: string) => {
    setProjects(projects.map(proj => 
      proj.id === selectedProjectId
        ? { ...proj, subProjects: proj.subProjects.filter(sp => sp.id !== subProjectId) }
        : proj
    ));
    toast.success('Подпроект удалён');
  };

  const handleAdjustRewards = () => {
    setIsRewardDialogOpen(false);
    toast.success('Награды обновлены!');
  };

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);
  const activeTasks = projectTasks.filter(t => !t.completed);
  const completedTasks = projectTasks.filter(t => t.completed);

  const totalRewards = {
    points: tasks.filter(t => t.completed && t.rewardType === 'points').reduce((sum, t) => sum + t.rewardAmount, 0) + manualRewards.points,
    minutes: tasks.filter(t => t.completed && t.rewardType === 'minutes').reduce((sum, t) => sum + t.rewardAmount, 0) + manualRewards.minutes,
    rubles: tasks.filter(t => t.completed && t.rewardType === 'rubles').reduce((sum, t) => sum + t.rewardAmount, 0) + manualRewards.rubles,
  };

  const tasksForSelectedDate = tasks.filter(task => 
    task.scheduledDate && selectedDate && isSameDay(task.scheduledDate, selectedDate)
  );

  const renderTaskCard = (task: Task) => {
    const category = categories.find(c => c.id === task.category);
    const subProject = selectedProject?.subProjects.find(sp => sp.id === task.subProjectId);
    const rewardIcon = task.rewardType === 'points' ? 'Star' : task.rewardType === 'minutes' ? 'Clock' : 'DollarSign';
    const rewardText = task.rewardType === 'points' ? 'баллов' : task.rewardType === 'minutes' ? 'мин' : '₽';

    return (
      <Card key={task.id} className={`p-4 transition-all hover:shadow-md hover-scale ${task.completed ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-8 h-8 rounded-lg ${category?.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
              <Icon name={category?.icon as any || 'Circle'} size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold mb-1 ${task.completed ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Icon name={rewardIcon as any} size={10} />
                  {task.rewardAmount} {rewardText}
                </Badge>
                {subProject && (
                  <Badge variant="outline" className="text-xs">
                    {subProject.name}
                  </Badge>
                )}
                {task.scheduledDate && (
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Icon name="Calendar" size={10} />
                    {format(task.scheduledDate, 'd MMM', { locale: ru })}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!task.completed ? (
              <Button
                onClick={() => handleCompleteTask(task.id)}
                size="sm"
                variant="ghost"
              >
                <Icon name="Check" size={16} />
              </Button>
            ) : (
              <Icon name="CheckCircle2" size={20} className="text-green-500" />
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Задачник Pro</h1>
              <p className="text-sm text-muted-foreground">Управляй проектами и достигай целей</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="Calendar" size={16} />
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
                        <h3 className="font-semibold mb-3 text-sm">
                          Задачи на {format(selectedDate, 'd MMMM yyyy', { locale: ru })}
                        </h3>
                        {tasksForSelectedDate.length === 0 ? (
                          <p className="text-xs text-muted-foreground">Нет задач на этот день</p>
                        ) : (
                          <div className="space-y-2">
                            {tasksForSelectedDate.map(task => (
                              <Card key={task.id} className="p-2">
                                <div className="flex items-center gap-2">
                                  {task.completed ? (
                                    <Icon name="CheckCircle2" size={14} className="text-green-500" />
                                  ) : (
                                    <Icon name="Circle" size={14} className="text-muted-foreground" />
                                  )}
                                  <span className={`text-xs ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
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
                  <Button size="sm" className="gap-2">
                    <Icon name="Plus" size={16} />
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
                    <div className="grid grid-cols-2 gap-4">
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
                                  <Icon name={cat.icon as any} size={14} />
                                  <span className="text-sm">{cat.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Подпроект</label>
                        <Select value={newTask.subProjectId} onValueChange={(value) => setNewTask({ ...newTask, subProjectId: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Без подпроекта" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Без подпроекта</SelectItem>
                            {selectedProject?.subProjects.map((sp) => (
                              <SelectItem key={sp.id} value={sp.id}>
                                {sp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card className="p-4 hover-scale cursor-pointer" onClick={() => setIsRewardDialogOpen(true)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Баллы</p>
                  <p className="text-2xl font-bold text-primary">{totalRewards.points}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="Star" size={20} className="text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-4 hover-scale cursor-pointer" onClick={() => setIsRewardDialogOpen(true)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Минуты</p>
                  <p className="text-2xl font-bold text-blue-500">{totalRewards.minutes}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Icon name="Clock" size={20} className="text-blue-500" />
                </div>
              </div>
            </Card>
            <Card className="p-4 hover-scale cursor-pointer" onClick={() => setIsRewardDialogOpen(true)}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Рубли</p>
                  <p className="text-2xl font-bold text-green-500">{totalRewards.rubles}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Icon name="DollarSign" size={20} className="text-green-500" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <Icon name="FolderKanban" size={16} />
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
                    <Icon name="Plus" size={14} />
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
                                <Icon name={icon as any} size={14} />
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
                            className={`w-full h-8 rounded-md ${color} ${newCategory.color === color ? 'ring-2 ring-foreground ring-offset-2' : ''}`}
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
                    className={`${cat.color} text-white gap-1 pr-6 cursor-pointer hover-scale text-xs`}
                    onClick={() => handleEditCategory(cat)}
                  >
                    <Icon name={cat.icon as any} size={12} />
                    {cat.name}
                  </Badge>
                  <button
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id);
                    }}
                  >
                    <Icon name="X" size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </header>

        <Dialog open={isRewardDialogOpen} onOpenChange={setIsRewardDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Корректировка наград</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Icon name="Star" size={14} className="text-primary" />
                  Баллы
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, points: manualRewards.points - 10 })}
                  >
                    <Icon name="Minus" size={14} />
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
                    <Icon name="Plus" size={14} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Icon name="Clock" size={14} className="text-blue-500" />
                  Минуты
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, minutes: manualRewards.minutes - 15 })}
                  >
                    <Icon name="Minus" size={14} />
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
                    <Icon name="Plus" size={14} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Icon name="DollarSign" size={14} className="text-green-500" />
                  Рубли
                </label>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setManualRewards({ ...manualRewards, rubles: manualRewards.rubles - 50 })}
                  >
                    <Icon name="Minus" size={14} />
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
                    <Icon name="Plus" size={14} />
                  </Button>
                </div>
              </div>
              <Button onClick={handleAdjustRewards} className="w-full">
                Применить
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-3">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">Проекты</h3>
                <Dialog open={isProjectDialogOpen} onOpenChange={(open) => {
                  setIsProjectDialogOpen(open);
                  if (!open) {
                    setEditingProject(null);
                    setNewProject({ name: '', icon: 'Folder', color: 'bg-blue-500' });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Icon name="Plus" size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProject ? 'Редактировать' : 'Создать'} проект</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Название</label>
                        <Input
                          placeholder="Название проекта"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Иконка</label>
                        <Select value={newProject.icon} onValueChange={(value) => setNewProject({ ...newProject, icon: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ICONS_LIST.map(icon => (
                              <SelectItem key={icon} value={icon}>
                                <div className="flex items-center gap-2">
                                  <Icon name={icon as any} size={14} />
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
                              className={`w-full h-8 rounded-md ${color} ${newProject.color === color ? 'ring-2 ring-foreground ring-offset-2' : ''}`}
                              onClick={() => setNewProject({ ...newProject, color })}
                            />
                          ))}
                        </div>
                      </div>
                      <Button 
                        onClick={editingProject ? handleUpdateProject : handleCreateProject} 
                        className="w-full"
                      >
                        {editingProject ? 'Сохранить' : 'Создать'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-1">
                {projects.map(project => (
                  <div key={project.id}>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent group ${
                        selectedProjectId === project.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <div className={`w-6 h-6 rounded ${project.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon name={project.icon as any} size={12} className="text-white" />
                      </div>
                      <span className="text-sm flex-1 truncate">{project.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                        >
                          <Icon name="Edit2" size={12} className="text-muted-foreground" />
                        </button>
                        {projects.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            <Icon name="Trash2" size={12} className="text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                    {selectedProjectId === project.id && project.subProjects.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {project.subProjects.map(sub => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 p-1.5 rounded text-xs text-muted-foreground hover:bg-accent cursor-pointer group"
                          >
                            <Icon name="ChevronRight" size={12} />
                            <span className="flex-1">{sub.name}</span>
                            <button
                              onClick={() => handleDeleteSubProject(sub.id)}
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Icon name="X" size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedProject && (
                <Dialog open={isSubProjectDialogOpen} onOpenChange={setIsSubProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-3 gap-2 text-xs">
                      <Icon name="Plus" size={12} />
                      Добавить подпроект
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Создать подпроект</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Название</label>
                        <Input
                          placeholder="Название подпроекта"
                          value={newSubProject.name}
                          onChange={(e) => setNewSubProject({ name: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleCreateSubProject} className="w-full">
                        Создать
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedProject?.name}</h2>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <Icon name="List" size={16} />
                </Button>
                <Button
                  variant={viewMode === 'board' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('board')}
                >
                  <Icon name="Columns" size={16} />
                </Button>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="space-y-3">
                {projectTasks.length === 0 ? (
                  <Card className="p-12">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Icon name="Inbox" size={32} className="text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Нет задач</h3>
                      <p className="text-sm text-muted-foreground">Создайте свою первую задачу</p>
                    </div>
                  </Card>
                ) : (
                  projectTasks.map(task => renderTaskCard(task))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Icon name="Circle" size={14} className="text-orange-500" />
                      Активные ({activeTasks.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {activeTasks.length === 0 ? (
                      <Card className="p-6">
                        <p className="text-xs text-muted-foreground text-center">Нет активных задач</p>
                      </Card>
                    ) : (
                      activeTasks.map(task => renderTaskCard(task))
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Icon name="CheckCircle2" size={14} className="text-green-500" />
                      Выполненные ({completedTasks.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {completedTasks.length === 0 ? (
                      <Card className="p-6">
                        <p className="text-xs text-muted-foreground text-center">Нет выполненных задач</p>
                      </Card>
                    ) : (
                      completedTasks.map(task => renderTaskCard(task))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
