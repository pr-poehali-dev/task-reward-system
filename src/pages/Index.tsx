import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { api, type User } from '@/lib/api';

type RewardType = 'points' | 'minutes' | 'rubles';
type ViewMode = 'list' | 'board';
type SidebarView = 'projects' | 'search' | 'completed' | 'categories' | 'rewards' | 'history';

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

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
}

interface EarnedRewards {
  points: number;
  minutes: number;
  rubles: number;
}

const ICONS_LIST = ['Star', 'Heart', 'Zap', 'Trophy', 'Target', 'Award', 'Flag', 'Rocket', 'Crown', 'Gift', 'Sparkles', 'Coffee', 'BookOpen', 'Code', 'Music', 'Camera', 'Palette', 'Briefcase', 'Home', 'User', 'Folder', 'FolderOpen', 'Package'];
const COLORS_LIST = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500'];

interface IndexProps {
  user: User;
  token: string;
  onLogout: () => void;
}

const Index = ({ user, token, onLogout }: IndexProps) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        scheduledDate: t.scheduledDate ? new Date(t.scheduledDate) : undefined,
      }));
    }
    return [];
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [
      { id: 'work', name: 'Работа', icon: 'Briefcase', color: 'bg-blue-500' },
      { id: 'personal', name: 'Личное', icon: 'User', color: 'bg-green-500' },
      { id: 'health', name: 'Здоровье', icon: 'Heart', color: 'bg-red-500' },
      { id: 'learning', name: 'Обучение', icon: 'BookOpen', color: 'bg-purple-500' },
      { id: 'home', name: 'Дом', icon: 'Home', color: 'bg-orange-500' },
    ];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [
      { id: 'default', name: 'Главный проект', icon: 'Folder', color: 'bg-blue-500', subProjects: [] },
    ];
  });

  const [selectedProjectId, setSelectedProjectId] = useState('default');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarView, setSidebarView] = useState<SidebarView>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activityLog, setActivityLog] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('activityLog');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((log: any) => ({
        ...log,
        timestamp: new Date(log.timestamp),
      }));
    }
    return [];
  });
  
  const [earnedRewards, setEarnedRewards] = useState<EarnedRewards>(() => {
    const saved = localStorage.getItem('earnedRewards');
    return saved ? JSON.parse(saved) : {
      points: 0,
      minutes: 0,
      rubles: 0,
    };
  });

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

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
  }, [activityLog]);

  useEffect(() => {
    localStorage.setItem('earnedRewards', JSON.stringify(earnedRewards));
  }, [earnedRewards]);

  const syncToCloud = useCallback(async () => {
    try {
      await api.syncData(token, {
        categories,
        projects,
        tasks: tasks.map(t => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          scheduledDate: t.scheduledDate?.toISOString(),
        })),
        rewards: earnedRewards,
        activityLogs: activityLog.map(log => ({
          ...log,
          timestamp: log.timestamp.toISOString(),
        })),
      });
    } catch (error) {
      console.error('Sync error:', error);
    }
  }, [token, categories, projects, tasks, earnedRewards, activityLog]);

  useEffect(() => {
    const loadCloudData = async () => {
      try {
        const data = await api.getData(token);
        console.log('Loaded cloud data:', data);
      } catch (error) {
        console.error('Load error:', error);
      }
    };
    loadCloudData();
  }, [token]);

  useEffect(() => {
    const interval = setInterval(syncToCloud, 30000);
    return () => clearInterval(interval);
  }, [syncToCloud]);

  const addActivityLog = (action: string, description: string) => {
    const log: ActivityLog = {
      id: Date.now().toString(),
      action,
      description,
      timestamp: new Date(),
    };
    setActivityLog(prev => [log, ...prev]);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(isDarkMode ? 'Светлая тема включена' : 'Тёмная тема включена');
    addActivityLog('Изменение темы', isDarkMode ? 'Включена светлая тема' : 'Включена тёмная тема');
  };

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
    addActivityLog('Создание задачи', `Создана задача: ${task.title}`);
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const rewardText = t.rewardType === 'points' ? 'баллов' : t.rewardType === 'minutes' ? 'минут' : 'рублей';
        toast.success(`+${t.rewardAmount} ${rewardText}`, {
          description: t.title,
        });
        
        setEarnedRewards(prev => ({
          ...prev,
          [t.rewardType]: prev[t.rewardType] + t.rewardAmount,
        }));
        
        addActivityLog('Выполнение задачи', `Задача "${t.title}" выполнена. Получено: +${t.rewardAmount} ${rewardText}`);
        
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    toast.success('Задача удалена');
    if (task) {
      addActivityLog('Удаление задачи', `Удалена задача: ${task.title}`);
    }
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
    addActivityLog('Создание категории', `Создана категория: ${category.name}`);
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
    addActivityLog('Обновление категории', `Категория обновлена`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setCategories(categories.filter(cat => cat.id !== categoryId));
    toast.success('Категория удалена');
    if (category) {
      addActivityLog('Удаление категории', `Удалена категория: ${category.name}`);
    }
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
    addActivityLog('Создание проекта', `Создан проект: ${project.name}`);
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
    toast.success('Проект обновлен!');
    addActivityLog('Обновление проекта', `Проект обновлен`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (projectId === 'default') {
      toast.error('Нельзя удалить главный проект');
      return;
    }
    const project = projects.find(p => p.id === projectId);
    setProjects(projects.filter(proj => proj.id !== projectId));
    setTasks(tasks.filter(task => task.projectId !== projectId));
    if (selectedProjectId === projectId) {
      setSelectedProjectId('default');
    }
    toast.success('Проект удален');
    if (project) {
      addActivityLog('Удаление проекта', `Удален проект: ${project.name}`);
    }
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
    addActivityLog('Создание подпроекта', `Создан подпроект: ${subProject.name}`);
  };

  const handleDeleteSubProject = (subProjectId: string) => {
    const project = projects.find(p => p.id === selectedProjectId);
    const subProject = project?.subProjects.find(sp => sp.id === subProjectId);
    
    setProjects(projects.map(proj => 
      proj.id === selectedProjectId 
        ? { ...proj, subProjects: proj.subProjects.filter(sp => sp.id !== subProjectId) }
        : proj
    ));
    setTasks(tasks.filter(task => task.subProjectId !== subProjectId));
    toast.success('Подпроект удален');
    
    if (subProject) {
      addActivityLog('Удаление подпроекта', `Удален подпроект: ${subProject.name}`);
    }
  };

  const handleAddManualReward = () => {
    if (manualRewards.points === 0 && manualRewards.minutes === 0 && manualRewards.rubles === 0) {
      toast.error('Введите хотя бы одну награду');
      return;
    }

    setEarnedRewards(prev => ({
      points: prev.points + manualRewards.points,
      minutes: prev.minutes + manualRewards.minutes,
      rubles: prev.rubles + manualRewards.rubles,
    }));

    const rewardDescriptions = [];
    if (manualRewards.points > 0) rewardDescriptions.push(`+${manualRewards.points} баллов`);
    if (manualRewards.minutes > 0) rewardDescriptions.push(`+${manualRewards.minutes} минут`);
    if (manualRewards.rubles > 0) rewardDescriptions.push(`+${manualRewards.rubles} рублей`);

    toast.success('Награды добавлены!', {
      description: rewardDescriptions.join(', '),
    });

    addActivityLog('Добавление наград', `Вручную добавлены награды: ${rewardDescriptions.join(', ')}`);

    setManualRewards({ points: 0, minutes: 0, rubles: 0 });
    setIsRewardDialogOpen(false);
  };

  const getCategoryById = (id: string) => categories.find(cat => cat.id === id);
  
  const activeTasks = tasks.filter(t => !t.completed && t.projectId === selectedProjectId);
  const completedTasks = tasks.filter(t => t.completed);
  
  const filteredTasks = searchQuery
    ? tasks.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredProjects = searchQuery
    ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const renderTaskCard = (task: Task, showProject = false) => {
    const category = getCategoryById(task.category);
    const project = projects.find(p => p.id === task.projectId);
    const subProject = project?.subProjects.find(sp => sp.id === task.subProjectId);

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
              {subProject && (
                <Badge variant="outline" className="text-xs">{subProject.name}</Badge>
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r border-border transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          {sidebarOpen && <h2 className="font-semibold text-foreground">Меню</h2>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icon name={sidebarOpen ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            <Button
              variant={sidebarView === 'projects' ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setSidebarView('projects')}
            >
              <Icon name="Folder" size={20} />
              {sidebarOpen && 'Проекты'}
            </Button>
            <Button
              variant={sidebarView === 'search' ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setSidebarView('search')}
            >
              <Icon name="Search" size={20} />
              {sidebarOpen && 'Поиск'}
            </Button>
            <Button
              variant={sidebarView === 'completed' ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setSidebarView('completed')}
            >
              <Icon name="CheckCircle" size={20} />
              {sidebarOpen && 'Выполненные'}
            </Button>
            <Button
              variant={sidebarView === 'categories' ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setSidebarView('categories')}
            >
              <Icon name="Tag" size={20} />
              {sidebarOpen && 'Категории'}
            </Button>
            <Button
              variant={sidebarView === 'rewards' ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setSidebarView('rewards')}
            >
              <Icon name="Trophy" size={20} />
              {sidebarOpen && 'Награды'}
            </Button>
            <Button
              variant={sidebarView === 'history' ? 'secondary' : 'ghost'}
              className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
              onClick={() => setSidebarView('history')}
            >
              <Icon name="Clock" size={20} />
              {sidebarOpen && 'История'}
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Задачник Pro</h1>
              <p className="text-sm text-muted-foreground">Управляй проектами и достигай целей</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-muted-foreground mr-2">{user.username}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={syncToCloud}
                className="gap-2"
              >
                <Icon name="Cloud" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="gap-2"
              >
                <Icon name={isDarkMode ? 'Sun' : 'Moon'} size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <Icon name="LogOut" size={16} />
              </Button>
              <Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="Calendar" size={16} />
                    {selectedDate ? format(selectedDate, 'd MMM', { locale: ru }) : 'Дата'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Выберите дату</DialogTitle>
                  </DialogHeader>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    locale={ru}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Sidebar Views */}
          {sidebarView === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Проекты</h2>
                <Dialog open={isProjectDialogOpen} onOpenChange={(open) => {
                  setIsProjectDialogOpen(open);
                  if (!open) {
                    setEditingProject(null);
                    setNewProject({ name: '', icon: 'Folder', color: 'bg-blue-500' });
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Icon name="Plus" size={16} />
                      Новый проект
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingProject ? 'Редактировать проект' : 'Новый проект'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Название</label>
                        <Input
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="Название проекта"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Иконка</label>
                        <div className="grid grid-cols-8 gap-2">
                          {ICONS_LIST.map(icon => (
                            <Button
                              key={icon}
                              variant={newProject.icon === icon ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setNewProject({ ...newProject, icon })}
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
                              className={`${color} h-10 rounded-md ${newProject.color === color ? 'ring-2 ring-foreground' : ''}`}
                              onClick={() => setNewProject({ ...newProject, color })}
                            />
                          ))}
                        </div>
                      </div>
                      <Button onClick={editingProject ? handleUpdateProject : handleCreateProject} className="w-full">
                        {editingProject ? 'Обновить' : 'Создать'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-3 mb-6">
                {projects.map(project => (
                  <Card
                    key={project.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedProjectId === project.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${project.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                          <Icon name={project.icon} size={20} className="text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {tasks.filter(t => t.projectId === project.id && !t.completed).length} активных задач
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                        >
                          <Icon name="Edit" size={16} />
                        </Button>
                        {project.id !== 'default' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProject(project.id);
                            }}
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {selectedProject && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Активные задачи</h2>
                    <div className="flex gap-2">
                      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="gap-2">
                            <Icon name="Plus" size={16} />
                            Новая задача
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Новая задача</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Название</label>
                              <Input
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="Название задачи"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Описание</label>
                              <Textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Описание задачи"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Категория</label>
                              <Select value={newTask.category} onValueChange={(value) => setNewTask({ ...newTask, category: value })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      <div className="flex items-center gap-2">
                                        <Icon name={cat.icon} size={16} />
                                        {cat.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {selectedProject.subProjects.length > 0 && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Подпроект</label>
                                <Select value={newTask.subProjectId} onValueChange={(value) => setNewTask({ ...newTask, subProjectId: value })}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Без подпроекта" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Без подпроекта</SelectItem>
                                    {selectedProject.subProjects.map(sp => (
                                      <SelectItem key={sp.id} value={sp.id}>{sp.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
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
                                  value={newTask.rewardAmount}
                                  onChange={(e) => setNewTask({ ...newTask, rewardAmount: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                            <Button onClick={handleCreateTask} className="w-full">Создать задачу</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog open={isSubProjectDialogOpen} onOpenChange={setIsSubProjectDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Icon name="FolderPlus" size={16} />
                            Подпроект
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Новый подпроект</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Название</label>
                              <Input
                                value={newSubProject.name}
                                onChange={(e) => setNewSubProject({ name: e.target.value })}
                                placeholder="Название подпроекта"
                              />
                            </div>
                            <Button onClick={handleCreateSubProject} className="w-full">Создать</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {selectedProject.subProjects.length > 0 && (
                    <div className="mb-4 flex gap-2 flex-wrap">
                      {selectedProject.subProjects.map(sp => (
                        <Badge key={sp.id} variant="outline" className="gap-2 px-3 py-1">
                          <span>{sp.name}</span>
                          <button onClick={() => handleDeleteSubProject(sp.id)}>
                            <Icon name="X" size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-3">
                    {activeTasks.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Icon name="CheckCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground">Нет активных задач</p>
                      </Card>
                    ) : (
                      activeTasks.map(task => renderTaskCard(task))
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {sidebarView === 'search' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Поиск</h2>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск задач и проектов..."
                className="mb-4"
              />
              {searchQuery && (
                <div className="space-y-6">
                  {filteredTasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Задачи ({filteredTasks.length})</h3>
                      <div className="space-y-3">
                        {filteredTasks.map(task => renderTaskCard(task, true))}
                      </div>
                    </div>
                  )}
                  {filteredProjects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Проекты ({filteredProjects.length})</h3>
                      <div className="space-y-3">
                        {filteredProjects.map(project => (
                          <Card
                            key={project.id}
                            className="p-4 cursor-pointer hover:shadow-md"
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setSidebarView('projects');
                              setSearchQuery('');
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`${project.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                                <Icon name={project.icon} size={20} className="text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{project.name}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {tasks.filter(t => t.projectId === project.id && !t.completed).length} активных задач
                                </p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredTasks.length === 0 && filteredProjects.length === 0 && (
                    <Card className="p-8 text-center">
                      <Icon name="Search" size={48} className="mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">Ничего не найдено</p>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {sidebarView === 'completed' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Выполненные задачи</h2>
              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Icon name="ListTodo" size={48} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Пока нет выполненных задач</p>
                  </Card>
                ) : (
                  completedTasks.map(task => renderTaskCard(task, true))
                )}
              </div>
            </div>
          )}

          {sidebarView === 'categories' && (
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
          )}

          {sidebarView === 'rewards' && (
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
                      <div>
                        <label className="text-sm font-medium mb-2 block">Баллы</label>
                        <Input
                          type="number"
                          value={manualRewards.points}
                          onChange={(e) => setManualRewards({ ...manualRewards, points: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Минуты</label>
                        <Input
                          type="number"
                          value={manualRewards.minutes}
                          onChange={(e) => setManualRewards({ ...manualRewards, minutes: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Рубли</label>
                        <Input
                          type="number"
                          value={manualRewards.rubles}
                          onChange={(e) => setManualRewards({ ...manualRewards, rubles: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <Button onClick={handleAddManualReward} className="w-full">Добавить</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4 grid-cols-3 mb-6">
                {earnedRewards.points > 0 && (
                  <Card className="p-6 text-center">
                    <Icon name="Star" size={32} className="mx-auto mb-2 text-yellow-500" />
                    <p className="text-3xl font-bold text-foreground">{earnedRewards.points}</p>
                    <p className="text-sm text-muted-foreground">Баллов заработано</p>
                  </Card>
                )}
                {earnedRewards.minutes > 0 && (
                  <Card className="p-6 text-center">
                    <Icon name="Clock" size={32} className="mx-auto mb-2 text-blue-500" />
                    <p className="text-3xl font-bold text-foreground">{earnedRewards.minutes}</p>
                    <p className="text-sm text-muted-foreground">Минут заработано</p>
                  </Card>
                )}
                {earnedRewards.rubles > 0 && (
                  <Card className="p-6 text-center">
                    <Icon name="DollarSign" size={32} className="mx-auto mb-2 text-green-500" />
                    <p className="text-3xl font-bold text-foreground">{earnedRewards.rubles}</p>
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
          )}

          {sidebarView === 'history' && (
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
                    <Card key={log.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{log.action}</h3>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(log.timestamp, 'HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;