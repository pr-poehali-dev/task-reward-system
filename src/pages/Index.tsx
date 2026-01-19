import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { User } from '@/lib/api';
import { useTaskManager } from '@/hooks/useTaskManager';
import TaskSidebar from '@/components/TaskSidebar';
import TaskViews from '@/components/TaskViews';

interface IndexProps {
  user: User;
  token: string;
  onLogout: () => void;
}

const Index = ({ user, token, onLogout }: IndexProps) => {
  const manager = useTaskManager(token);

  return (
    <div className="min-h-screen bg-background flex">
      <TaskSidebar
        sidebarOpen={manager.sidebarOpen}
        setSidebarOpen={manager.setSidebarOpen}
        sidebarView={manager.sidebarView}
        setSidebarView={manager.setSidebarView}
      />

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
                onClick={manager.syncToCloud}
                className="gap-2"
              >
                <Icon name="Cloud" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={manager.toggleTheme}
                className="gap-2"
              >
                <Icon name={manager.isDarkMode ? 'Sun' : 'Moon'} size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="gap-2"
              >
                <Icon name="LogOut" size={16} />
              </Button>
              <Dialog open={manager.isCalendarOpen} onOpenChange={manager.setIsCalendarOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon name="Calendar" size={16} />
                    {manager.selectedDate ? format(manager.selectedDate, 'd MMM', { locale: ru }) : 'Дата'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Выберите дату</DialogTitle>
                  </DialogHeader>
                  <Calendar
                    mode="single"
                    selected={manager.selectedDate}
                    onSelect={(date) => {
                      manager.setSelectedDate(date);
                      manager.setIsCalendarOpen(false);
                    }}
                    locale={ru}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TaskViews
            sidebarView={manager.sidebarView}
            tasks={manager.tasks}
            categories={manager.categories}
            projects={manager.projects}
            selectedProjectId={manager.selectedProjectId}
            setSelectedProjectId={manager.setSelectedProjectId}
            selectedProject={manager.selectedProject}
            taskViewMode={manager.taskViewMode}
            setTaskViewMode={manager.setTaskViewMode}
            activityLog={manager.activityLog}
            earnedRewards={manager.earnedRewards}
            searchQuery={manager.searchQuery}
            setSearchQuery={manager.setSearchQuery}
            isTaskDialogOpen={manager.isTaskDialogOpen}
            setIsTaskDialogOpen={manager.setIsTaskDialogOpen}
            isCategoryDialogOpen={manager.isCategoryDialogOpen}
            setIsCategoryDialogOpen={manager.setIsCategoryDialogOpen}
            isProjectDialogOpen={manager.isProjectDialogOpen}
            setIsProjectDialogOpen={manager.setIsProjectDialogOpen}
            isSubProjectDialogOpen={manager.isSubProjectDialogOpen}
            setIsSubProjectDialogOpen={manager.setIsSubProjectDialogOpen}
            isRewardDialogOpen={manager.isRewardDialogOpen}
            setIsRewardDialogOpen={manager.setIsRewardDialogOpen}
            newTask={manager.newTask}
            setNewTask={manager.setNewTask}
            newCategory={manager.newCategory}
            setNewCategory={manager.setNewCategory}
            newProject={manager.newProject}
            setNewProject={manager.setNewProject}
            newSubProject={manager.newSubProject}
            setNewSubProject={manager.setNewSubProject}
            editingCategory={manager.editingCategory}
            setEditingCategory={manager.setEditingCategory}
            editingProject={manager.editingProject}
            setEditingProject={manager.setEditingProject}
            manualRewards={manager.manualRewards}
            setManualRewards={manager.setManualRewards}
            handleCreateTask={manager.handleCreateTask}
            handleCompleteTask={manager.handleCompleteTask}
            handleDeleteTask={manager.handleDeleteTask}
            handleCreateCategory={manager.handleCreateCategory}
            handleEditCategory={manager.handleEditCategory}
            handleUpdateCategory={manager.handleUpdateCategory}
            handleDeleteCategory={manager.handleDeleteCategory}
            handleCreateProject={manager.handleCreateProject}
            handleEditProject={manager.handleEditProject}
            handleUpdateProject={manager.handleUpdateProject}
            handleDeleteProject={manager.handleDeleteProject}
            handleCreateSubProject={manager.handleCreateSubProject}
            handleDeleteSubProject={manager.handleDeleteSubProject}
            handleAddManualReward={manager.handleAddManualReward}
            getCategoryById={manager.getCategoryById}
            setSidebarView={manager.setSidebarView}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;