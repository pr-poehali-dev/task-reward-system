import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Task, Category, Project, Section, ActivityLog, EarnedRewards, RewardType, Priority, ViewMode, SidebarView } from '@/types/task';

export const useTaskManager = (token: string) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        scheduledDate: t.scheduledDate ? new Date(t.scheduledDate) : undefined,
        priority: t.priority || 2 as Priority,
      }));
    }
    return [];
  });
  
  const [categories, setCategories] = useState<Category[]>([]);

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((p: any) => ({
        ...p,
        sections: (p.sections || []).map((s: any, idx: number) => ({
          ...s,
          order: s.order !== undefined ? s.order : idx + 1
        }))
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
    priority: 2 as Priority,
    rewardType: 'minutes' as RewardType,
    rewardAmount: 10,
    rewardDescription: '',
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

  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem('lastSyncTime');
    return saved ? new Date(saved) : null;
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
    if (!isInitialLoad) {
      setHasUnsyncedChanges(true);
    }
  }, [tasks, isInitialLoad]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
    if (!isInitialLoad) {
      setHasUnsyncedChanges(true);
    }
  }, [categories, isInitialLoad]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
    if (!isInitialLoad) {
      setHasUnsyncedChanges(true);
    }
  }, [projects, isInitialLoad]);

  useEffect(() => {
    localStorage.setItem('activityLog', JSON.stringify(activityLog));
    if (!isInitialLoad) {
      setHasUnsyncedChanges(true);
    }
  }, [activityLog, isInitialLoad]);

  useEffect(() => {
    localStorage.setItem('earnedRewards', JSON.stringify(earnedRewards));
    if (!isInitialLoad) {
      setHasUnsyncedChanges(true);
    }
  }, [earnedRewards, isInitialLoad]);

  useEffect(() => {
    localStorage.setItem('taskViewMode', JSON.stringify(taskViewMode));
  }, [taskViewMode]);

  const syncToCloud = useCallback(async () => {
    setIsSyncing(true);
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
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      setHasUnsyncedChanges(false);
      localStorage.setItem('lastSyncTime', syncTime.toISOString());
      toast.success('Данные синхронизированы с облаком');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Ошибка синхронизации');
    } finally {
      setIsSyncing(false);
    }
  }, [token, categories, projects, tasks, earnedRewards, activityLog]);

  useEffect(() => {
    const loadCloudData = async () => {
      try {
        const data = await api.getData(token);
        console.log('Loaded cloud data:', data);
        setIsInitialLoad(false);
        
        if (data.projects && data.projects.length > 0) {
          const migratedProjects = data.projects.map((p: any) => ({
            ...p,
            sections: (p.sections || []).map((s: any, idx: number) => ({
              ...s,
              order: s.order !== undefined ? s.order : idx + 1
            }))
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
            priority: t.priority || 2 as Priority,
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



  const addActivityLog = (action: string, description: string, undoData?: ActivityLog['undoData']) => {
    const log: ActivityLog = {
      id: Date.now().toString(),
      action,
      description,
      timestamp: new Date(),
      undoData,
    };
    setActivityLog(prev => [log, ...prev]);
  };

  const handleUndoAction = (logId: string) => {
    const log = activityLog.find(l => l.id === logId);
    if (!log || !log.undoData) return;

    const { type, data } = log.undoData;

    switch (type) {
      case 'task_complete':
        handleUncompleteTask(data.taskId);
        break;
      
      case 'task_delete':
        setTasks(prev => [...prev, data.task]);
        toast.success('Задача восстановлена');
        break;
      
      case 'task_create':
        setTasks(prev => prev.filter(t => t.id !== data.taskId));
        toast.success('Создание задачи отменено');
        break;
      
      case 'category_delete':
        setCategories(prev => [...prev, data.category]);
        toast.success('Категория восстановлена');
        break;
      
      case 'project_delete':
        setProjects(prev => [...prev, data.project]);
        toast.success('Проект восстановлен');
        break;
      
      case 'section_delete':
        setProjects(prev => prev.map(p => 
          p.id === data.projectId 
            ? { ...p, sections: [...(p.sections || []), data.section] }
            : p
        ));
        setTasks(prev => [...prev, ...data.sectionTasks]);
        toast.success('Раздел восстановлен');
        break;
      
      case 'theme_change':
        setIsDarkMode(data.previousTheme);
        toast.success('Тема изменена обратно');
        break;
      
      case 'reward_change':
        if (data.previousRewards) {
          setEarnedRewards(data.previousRewards);
        } else if (data.rewardType && data.previousValue !== undefined) {
          setEarnedRewards(prev => ({ ...prev, [data.rewardType]: data.previousValue }));
        }
        toast.success('Награды восстановлены');
        break;
    }

    setActivityLog(prev => prev.filter(l => l.id !== logId));
  };

  const toggleTheme = () => {
    const previousTheme = isDarkMode;
    setIsDarkMode(!isDarkMode);
    toast.success(isDarkMode ? 'Светлая тема включена' : 'Тёмная тема включена');
    addActivityLog(
      'Изменение темы', 
      isDarkMode ? 'Включена светлая тема' : 'Включена тёмная тема',
      { type: 'theme_change', data: { previousTheme } }
    );
  };

  const handleCreateTask = (overrideSectionId?: string) => {
    if (!newTask.title.trim()) {
      toast.error('Введите название задачи');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      sectionId: overrideSectionId !== undefined ? overrideSectionId : newTask.sectionId,
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
      priority: 2,
      rewardType: 'minutes',
      rewardAmount: 10,
      rewardDescription: '',
      sectionId: '',
    });
    setSelectedDate(new Date());
    toast.success('Задача создана!');
    addActivityLog(
      'Создание задачи', 
      `Создана задача: ${task.title}`,
      { type: 'task_create', data: { taskId: task.id } }
    );
  };

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const rewardText = t.rewardType === 'points' ? 'баллов' : t.rewardType === 'minutes' ? 'минут' : t.rewardType === 'rubles' ? 'рублей' : 'приз';
        const sign = t.rewardAmount >= 0 ? '+' : '';
        const rewardDisplay = t.rewardType === 'prize' ? t.rewardDescription || 'приз' : `${sign}${t.rewardAmount} ${rewardText}`;
        toast.success(rewardDisplay, {
          description: t.title,
        });
        
        if (t.rewardType !== 'prize') {
          setEarnedRewards(prev => ({
            ...prev,
            [t.rewardType]: prev[t.rewardType] + t.rewardAmount,
          }));
        }
        
        addActivityLog(
          'Выполнение задачи', 
          `Задача "${t.title}" выполнена. Получено: ${sign}${t.rewardAmount} ${rewardText}`,
          { type: 'task_complete', data: { taskId: t.id } }
        );
        
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  const handleUncompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.completed) return;

    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        const rewardText = t.rewardType === 'points' ? 'баллов' : t.rewardType === 'minutes' ? 'минут' : t.rewardType === 'rubles' ? 'рублей' : 'приз';
        
        if (t.rewardType !== 'prize') {
          setEarnedRewards(prev => {
            const newValue = prev[t.rewardType] - t.rewardAmount;
            return {
              ...prev,
              [t.rewardType]: newValue,
            };
          });
        }
        
        const sign = t.rewardAmount >= 0 ? '-' : '+';
        addActivityLog('Возврат задачи', `Задача "${t.title}" возвращена в активные. Списано: ${sign}${Math.abs(t.rewardAmount)} ${rewardText}`);
        toast.info(`Задача возвращена в активные`, { description: t.title });
        
        return { ...t, completed: false };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    toast.success('Задача удалена');
    if (task) {
      addActivityLog(
        'Удаление задачи', 
        `Удалена задача: ${task.title}`,
        { type: 'task_delete', data: { task } }
      );
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
      addActivityLog(
        'Удаление категории', 
        `Удалена категория: ${category.name}`,
        { type: 'category_delete', data: { category } }
      );
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
      addActivityLog(
        'Удаление проекта', 
        `Удален проект: ${project.name}`,
        { type: 'project_delete', data: { project } }
      );
    }
  };

  const handleCreateSection = () => {
    if (!newSection.name.trim()) {
      toast.error('Введите название раздела');
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    const maxOrder = project?.sections?.reduce((max, s) => Math.max(max, s.order || 0), 0) || 0;

    const section: Section = {
      id: Date.now().toString(),
      name: newSection.name,
      projectId: selectedProjectId,
      order: maxOrder + 1,
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
    const sectionTasks = tasks.filter(task => task.sectionId === sectionId);
    
    setProjects(projects.map(proj => 
      proj.id === selectedProjectId 
        ? { ...proj, sections: (proj.sections || []).filter(s => s.id !== sectionId) }
        : proj
    ));
    setTasks(tasks.filter(task => task.sectionId !== sectionId));
    toast.success('Раздел удалён');
    
    if (section) {
      addActivityLog(
        'Удаление раздела', 
        `Удалён раздел: ${section.name}`,
        { type: 'section_delete', data: { section, projectId: selectedProjectId, sectionTasks } }
      );
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

  const getCategoryById = (id: string) => undefined;

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
    handleUncompleteTask,
    handleUndoAction,
    getCategoryById,
    syncToCloud,
    isSyncing,
    hasUnsyncedChanges,
    lastSyncTime,
    setEarnedRewards,
    setProjects,
    setTasks,
    addActivityLog,
  };
};