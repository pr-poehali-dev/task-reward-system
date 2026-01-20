import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Task, Category, Project, Section, ActivityLog, EarnedRewards, RewardType, ViewMode, SidebarView } from '@/types/task';

export const useTaskManager = (token: string) => {
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
    if (saved) {
      const parsed = JSON.parse(saved);
      // Миграция: добавляем sections если его нет
      return parsed.map((p: any) => ({
        ...p,
        sections: p.sections || []
      }));
    }
    return [
      { id: 'default', name: 'Главный проект', icon: 'Folder', color: 'bg-blue-500', sections: [] },
    ];
  });

  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed[0]?.id || 'default';
    }
    return 'default';
  });
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [taskViewMode, setTaskViewMode] = useState<'list' | 'grid'>(() => {
    const saved = localStorage.getItem('taskViewMode');
    return saved ? JSON.parse(saved) : 'list';
  });
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
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'work',
    rewardType: 'minutes' as RewardType,
    rewardAmount: 10,
    sectionId: '',
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

  const [newSection, setNewSection] = useState({
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

  // Если проект не найден, выбираем первый доступный
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [selectedProject, projects]);

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

  useEffect(() => {
    localStorage.setItem('taskViewMode', JSON.stringify(taskViewMode));
  }, [taskViewMode]);

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
        
        if (data.projects && data.projects.length > 0) {
          // Миграция: добавляем sections если его нет
          const migratedProjects = data.projects.map((p: any) => ({
            ...p,
            sections: p.sections || []
          }));
          setProjects(migratedProjects);
        }
        
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        
        if (data.tasks && data.tasks.length > 0) {
          const parsedTasks = data.tasks.map((t: any) => ({
            ...t,
            createdAt: new Date(t.created_at),
            scheduledDate: t.scheduled_date ? new Date(t.scheduled_date) : undefined,
          }));
          setTasks(parsedTasks);
        }
        
        if (data.rewards) {
          setEarnedRewards(data.rewards);
        }
      } catch (error) {
        console.error('Load error:', error);
      }
    };
    loadCloudData();
  }, [token]);

  useEffect(() => {
    const interval = setInterval(syncToCloud, 300000);
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
      rewardType: 'minutes',
      rewardAmount: 10,
      sectionId: '',
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
      sections: [],
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

  const handleCreateSection = () => {
    if (!newSection.name.trim()) {
      toast.error('Введите название раздела');
      return;
    }

    const section: Section = {
      id: Date.now().toString(),
      name: newSection.name,
      projectId: selectedProjectId,
    };

    setProjects(projects.map(proj => 
      proj.id === selectedProjectId 
        ? { ...proj, sections: [...(proj.sections || []), section] }
        : proj
    ));

    setIsSectionDialogOpen(false);
    setNewSection({ name: '' });
    toast.success('Раздел создан!');
    addActivityLog('Создание раздела', `Создан раздел: ${section.name}`);
  };

  const handleDeleteSection = (sectionId: string) => {
    const project = projects.find(p => p.id === selectedProjectId);
    const section = project?.sections?.find(s => s.id === sectionId);
    
    setProjects(projects.map(proj => 
      proj.id === selectedProjectId 
        ? { ...proj, sections: (proj.sections || []).filter(s => s.id !== sectionId) }
        : proj
    ));
    setTasks(tasks.filter(task => task.sectionId !== sectionId));
    toast.success('Раздел удалён');
    
    if (section) {
      addActivityLog('Удаление раздела', `Удалён раздел: ${section.name}`);
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

  return {
    tasks,
    categories,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    viewMode,
    setViewMode,
    taskViewMode,
    setTaskViewMode,
    isDarkMode,
    toggleTheme,
    sidebarOpen,
    setSidebarOpen,
    sidebarView,
    setSidebarView,
    searchQuery,
    setSearchQuery,
    activityLog,
    earnedRewards,
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    isCategoryDialogOpen,
    setIsCategoryDialogOpen,
    isProjectDialogOpen,
    setIsProjectDialogOpen,
    isSectionDialogOpen,
    setIsSectionDialogOpen,
    isRewardDialogOpen,
    setIsRewardDialogOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    selectedDate,
    setSelectedDate,
    newTask,
    setNewTask,
    newCategory,
    setNewCategory,
    newProject,
    setNewProject,
    newSection,
    setNewSection,
    editingCategory,
    setEditingCategory,
    editingProject,
    setEditingProject,
    manualRewards,
    setManualRewards,
    selectedProject,
    handleCreateTask,
    handleCompleteTask,
    handleDeleteTask,
    handleCreateCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    handleCreateProject,
    handleEditProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateSection,
    handleDeleteSection,
    handleAddManualReward,
    getCategoryById,
    syncToCloud,
  };
};