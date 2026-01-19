import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { SidebarView, Project } from '@/types/task';
import { ICONS_LIST, COLORS_LIST } from '@/types/task';

interface TaskSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  isProjectDialogOpen: boolean;
  setIsProjectDialogOpen: (open: boolean) => void;
  newProject: { name: string; icon: string; color: string };
  setNewProject: (project: any) => void;
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
  handleCreateProject: () => void;
  handleEditProject: (project: Project) => void;
  handleUpdateProject: () => void;
  handleDeleteProject: (id: string) => void;
}

export const TaskSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarView,
  setSidebarView,
  projects,
  selectedProjectId,
  setSelectedProjectId,
  isProjectDialogOpen,
  setIsProjectDialogOpen,
  newProject,
  setNewProject,
  editingProject,
  setEditingProject,
  handleCreateProject,
  handleEditProject,
  handleUpdateProject,
  handleDeleteProject,
}: TaskSidebarProps) => {
  return (
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
          
          <div className="my-2 border-t border-border" />
          
          {sidebarOpen && (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium text-muted-foreground">Проекты</span>
                <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Icon name="Plus" size={14} />
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
                        <div className="grid grid-cols-6 gap-2">
                          {ICONS_LIST.map(icon => (
                            <Button
                              key={icon}
                              variant={newProject.icon === icon ? 'secondary' : 'outline'}
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
              
              {projects.map(project => (
                <div
                  key={project.id}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent ${
                    selectedProjectId === project.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSidebarView('projects');
                  }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`${project.color} w-6 h-6 rounded flex items-center justify-center flex-shrink-0`}>
                      <Icon name={project.icon} size={14} className="text-white" />
                    </div>
                    <span className="text-sm truncate">{project.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProject(project);
                      }}
                    >
                      <Icon name="Edit" size={12} />
                    </Button>
                    {project.id !== 'default' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                      >
                        <Icon name="Trash2" size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!sidebarOpen && (
            <Button
              variant={sidebarView === 'projects' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2 px-2"
              onClick={() => setSidebarView('projects')}
            >
              <Icon name="Folder" size={20} />
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TaskSidebar;