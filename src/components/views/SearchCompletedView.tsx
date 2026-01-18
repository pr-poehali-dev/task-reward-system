import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { Task, Category, Project, SidebarView } from '@/types/task';
import { TaskCard } from './TaskCard';

interface SearchCompletedViewProps {
  viewType: 'search' | 'completed';
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedProjectId: (id: string) => void;
  setSidebarView: (view: SidebarView) => void;
  getCategoryById: (id: string) => Category | undefined;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
}

export const SearchCompletedView = (props: SearchCompletedViewProps) => {
  const {
    viewType,
    tasks,
    projects,
    searchQuery,
    setSearchQuery,
    setSelectedProjectId,
    setSidebarView,
    getCategoryById,
    handleCompleteTask,
    handleDeleteTask,
  } = props;

  if (viewType === 'search') {
    const filteredTasks = searchQuery
      ? tasks.filter(t => 
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

    const filteredProjects = searchQuery
      ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : [];

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
                  {filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      showProject={true}
                      projects={projects}
                      getCategoryById={getCategoryById}
                      handleCompleteTask={handleCompleteTask}
                      handleDeleteTask={handleDeleteTask}
                    />
                  ))}
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

  if (viewType === 'completed') {
    const completedTasks = tasks.filter(t => t.completed);

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
            completedTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                showProject={true}
                projects={projects}
                getCategoryById={getCategoryById}
                handleCompleteTask={handleCompleteTask}
                handleDeleteTask={handleDeleteTask}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default SearchCompletedView;
