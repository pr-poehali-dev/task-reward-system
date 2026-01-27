import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
        projects={manager.projects}
        selectedProjectId={manager.selectedProjectId}
        setSelectedProjectId={manager.setSelectedProjectId}
        isProjectDialogOpen={manager.isProjectDialogOpen}
        setIsProjectDialogOpen={manager.setIsProjectDialogOpen}
        newProject={manager.newProject}
        setNewProject={manager.setNewProject}
        editingProject={manager.editingProject}
        setEditingProject={manager.setEditingProject}
        handleCreateProject={manager.handleCreateProject}
        handleEditProject={manager.handleEditProject}
        handleUpdateProject={manager.handleUpdateProject}
        handleDeleteProject={manager.handleDeleteProject}
      />

      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-muted-foreground">{user.username}</span>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center w-6 h-6 bg-yellow-500/10 rounded-full cursor-help">
                        <span className="text-xs">⭐</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm font-medium">{manager.earnedRewards.points} баллов</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-500/10 rounded-full cursor-help">
                        <span className="text-xs">⏱️</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm font-medium">{manager.earnedRewards.minutes} минут</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center w-6 h-6 bg-green-500/10 rounded-full cursor-help">
                        <span className="text-xs">💰</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm font-medium">{manager.earnedRewards.rubles} рублей</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={manager.syncToCloud}
                  disabled={manager.isSyncing}
                  className="gap-2"
                >
                  <Icon 
                    name="Cloud" 
                    size={16} 
                    className={manager.isSyncing ? 'animate-pulse' : ''}
                  />
                  {manager.isSyncing && <span className="text-xs">Синхронизация...</span>}
                </Button>
                {manager.hasUnsyncedChanges && !manager.isSyncing && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-background animate-pulse" />
                )}
              </div>
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
            isSectionDialogOpen={manager.isSectionDialogOpen}
            setIsSectionDialogOpen={manager.setIsSectionDialogOpen}
            isRewardDialogOpen={manager.isRewardDialogOpen}
            setIsRewardDialogOpen={manager.setIsRewardDialogOpen}
            newTask={manager.newTask}
            setNewTask={manager.setNewTask}
            newCategory={manager.newCategory}
            setNewCategory={manager.setNewCategory}
            newProject={manager.newProject}
            setNewProject={manager.setNewProject}
            newSection={manager.newSection}
            setNewSection={manager.setNewSection}
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
            handleCreateSection={manager.handleCreateSection}
            handleDeleteSection={manager.handleDeleteSection}
            handleAddManualReward={manager.handleAddManualReward}
            handleUncompleteTask={manager.handleUncompleteTask}
            handleUndoAction={manager.handleUndoAction}
            getCategoryById={manager.getCategoryById}
            setSidebarView={manager.setSidebarView}
            setEarnedRewards={manager.setEarnedRewards}
            setProjects={manager.setProjects}
            setTasks={manager.setTasks}
            addActivityLog={manager.addActivityLog}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;