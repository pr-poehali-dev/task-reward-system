import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Task, Category, Project, RewardType } from '@/types/task';
import { ICONS_LIST, COLORS_LIST } from '@/types/task';
import { TaskCard } from './TaskCard';

interface ProjectsViewProps {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | undefined;
  taskViewMode?: 'list' | 'grid';
  setTaskViewMode?: (mode: 'list' | 'grid') => void;
  isTaskDialogOpen: boolean;
  setIsTaskDialogOpen: (open: boolean) => void;
  isProjectDialogOpen: boolean;
  setIsProjectDialogOpen: (open: boolean) => void;
  isSubProjectDialogOpen: boolean;
  setIsSubProjectDialogOpen: (open: boolean) => void;
  newTask: {
    title: string;
    description: string;
    category: string;
    rewardType: RewardType;
    rewardAmount: number;
    subProjectId: string;
  };
  setNewTask: (task: any) => void;
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
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  handleCreateTask: () => void;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  handleCreateProject: () => void;
  handleEditProject: (project: Project) => void;
  handleUpdateProject: () => void;
  handleDeleteProject: (id: string) => void;
  handleCreateSubProject: () => void;
  handleDeleteSubProject: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
}

export const ProjectsView = (props: ProjectsViewProps) => {
  const {
    tasks,
    categories,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    selectedProject,
    taskViewMode = 'list',
    setTaskViewMode,
    isTaskDialogOpen,
    setIsTaskDialogOpen,
    isProjectDialogOpen,
    setIsProjectDialogOpen,
    isSubProjectDialogOpen,
    setIsSubProjectDialogOpen,
    newTask,
    setNewTask,
    newProject,
    setNewProject,
    newSubProject,
    setNewSubProject,
    editingProject,
    setEditingProject,
    handleCreateTask,
    handleCompleteTask,
    handleDeleteTask,
    handleCreateProject,
    handleEditProject,
    handleUpdateProject,
    handleDeleteProject,
    handleCreateSubProject,
    handleDeleteSubProject,
    getCategoryById,
  } = props;

  const activeTasks = tasks.filter(t => !t.completed && t.projectId === selectedProjectId);

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTaskViewMode?.('list')}
                className={taskViewMode === 'list' ? 'bg-accent' : ''}
              >
                <Icon name="List" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTaskViewMode?.('grid')}
                className={taskViewMode === 'grid' ? 'bg-accent' : ''}
              >
                <Icon name="LayoutGrid" size={16} />
              </Button>
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

          <div className={taskViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-3'}>
            {activeTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Нет активных задач</p>
              </Card>
            ) : (
              activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projects={projects}
                  getCategoryById={getCategoryById}
                  handleCompleteTask={handleCompleteTask}
                  handleDeleteTask={handleDeleteTask}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectsView;