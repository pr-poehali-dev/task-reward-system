import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task, Category, Project, ActivityLog, EarnedRewards, RewardType, SidebarView } from '@/types/task';
import { ICONS_LIST, COLORS_LIST } from '@/types/task';

interface TaskViewsProps {
  sidebarView: SidebarView;
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | undefined;
  activityLog: ActivityLog[];
  earnedRewards: EarnedRewards;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isTaskDialogOpen: boolean;
  setIsTaskDialogOpen: (open: boolean) => void;
  isCategoryDialogOpen: boolean;
  setIsCategoryDialogOpen: (open: boolean) => void;
  isProjectDialogOpen: boolean;
  setIsProjectDialogOpen: (open: boolean) => void;
  isSubProjectDialogOpen: boolean;
  setIsSubProjectDialogOpen: (open: boolean) => void;
  isRewardDialogOpen: boolean;
  setIsRewardDialogOpen: (open: boolean) => void;
  newTask: {
    title: string;
    description: string;
    category: string;
    rewardType: RewardType;
    rewardAmount: number;
    subProjectId: string;
  };
  setNewTask: (task: any) => void;
  newCategory: {
    name: string;
    icon: string;
    color: string;
  };
  setNewCategory: (category: any) => void;
  newProject: {
    name: string;
    icon: string;
    color: string;
  };
  setNewProject: (project: any) => void;
  newSubProject: {
    name: string;
  };
  setNewSubProject: (subProject: any) => void;
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  manualRewards: {
    points: number;
    minutes: number;
    rubles: number;
  };
  setManualRewards: (rewards: any) => void;
  handleCreateTask: () => void;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  handleCreateCategory: () => void;
  handleEditCategory: (category: Category) => void;
  handleUpdateCategory: () => void;
  handleDeleteCategory: (id: string) => void;
  handleCreateProject: () => void;
  handleEditProject: (project: Project) => void;
  handleUpdateProject: () => void;
  handleDeleteProject: (id: string) => void;
  handleCreateSubProject: () => void;
  handleDeleteSubProject: (id: string) => void;
  handleAddManualReward: () => void;
  getCategoryById: (id: string) => Category | undefined;
  setSidebarView: (view: SidebarView) => void;
}

export const TaskViews = (props: TaskViewsProps) => {
  const {
    sidebarView,
    tasks,
    categories,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    activityLog,
    earnedRewards,
    searchQuery,
    setSearchQuery,
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    isCategoryDialogOpen,
    setIsCategoryDialogOpen,
    isProjectDialogOpen,
    setIsProjectDialogOpen,
    isSubProjectDialogOpen,
    setIsSubProjectDialogOpen,
    isRewardDialogOpen,
    setIsRewardDialogOpen,
    newTask,
    setNewTask,
    newCategory,
    setNewCategory,
    newProject,
    setNewProject,
    newSubProject,
    setNewSubProject,
    editingCategory,
    setEditingCategory,
    editingProject,
    setEditingProject,
    manualRewards,
    setManualRewards,
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
    handleCreateSubProject,
    handleDeleteSubProject,
    handleAddManualReward,
    getCategoryById,
    setSidebarView,
  } = props;

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

  if (sidebarView === 'projects') {
    return (
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
    );
  }

  if (sidebarView === 'search') {
    return (
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
    );
  }

  if (sidebarView === 'completed') {
    return (
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
    );
  }

  if (sidebarView === 'categories') {
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

  if (sidebarView === 'rewards') {
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
    );
  }

  if (sidebarView === 'history') {
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
    );
  }

  return null;
};

export default TaskViews;
