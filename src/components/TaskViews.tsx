import type { Task, Category, Project, ActivityLog, EarnedRewards, RewardType, SidebarView } from '@/types/task';
import ProjectsView from './views/ProjectsView';
import SearchCompletedView from './views/SearchCompletedView';
import CategoriesRewardsView from './views/CategoriesRewardsView';

interface TaskViewsProps {
  sidebarView: SidebarView;
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  selectedProject: Project | undefined;
  taskViewMode?: 'list' | 'grid';
  setTaskViewMode?: (mode: 'list' | 'grid') => void;
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
  isSectionDialogOpen: boolean;
  setIsSectionDialogOpen: (open: boolean) => void;
  isRewardDialogOpen: boolean;
  setIsRewardDialogOpen: (open: boolean) => void;
  newTask: {
    title: string;
    description: string;
    category: string;
    rewardType: RewardType;
    rewardAmount: number;
    sectionId: string;
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
  newSection: {
    name: string;
  };
  setNewSection: (section: any) => void;
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
  handleCreateTask: (overrideSectionId?: string) => void;
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
  handleCreateSection: () => void;
  handleDeleteSection: (id: string) => void;
  handleAddManualReward: () => void;
  handleUncompleteTask?: (id: string) => void;
  handleUndoAction: (logId: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  setSidebarView: (view: SidebarView) => void;
  setEarnedRewards?: (rewards: EarnedRewards | ((prev: EarnedRewards) => EarnedRewards)) => void;
  setProjects?: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
}

export const TaskViews = (props: TaskViewsProps) => {
  const { sidebarView } = props;

  if (sidebarView === 'projects') {
    return (
      <ProjectsView
        tasks={props.tasks}
        categories={props.categories}
        projects={props.projects}
        selectedProjectId={props.selectedProjectId}
        setSelectedProjectId={props.setSelectedProjectId}
        selectedProject={props.selectedProject}
        isSectionDialogOpen={props.isSectionDialogOpen}
        setIsSectionDialogOpen={props.setIsSectionDialogOpen}
        newSection={props.newSection}
        setNewSection={props.setNewSection}
        newTask={props.newTask}
        setNewTask={props.setNewTask}
        handleCreateTask={props.handleCreateTask}
        handleCreateSection={props.handleCreateSection}
        handleDeleteSection={props.handleDeleteSection}
        handleCompleteTask={props.handleCompleteTask}
        handleDeleteTask={props.handleDeleteTask}
        getCategoryById={props.getCategoryById}
        setProjects={props.setProjects}
        setTasks={props.setTasks}
      />
    );
  }

  if (sidebarView === 'search' || sidebarView === 'completed') {
    return (
      <SearchCompletedView
        viewType={sidebarView}
        tasks={props.tasks}
        projects={props.projects}
        searchQuery={props.searchQuery}
        setSearchQuery={props.setSearchQuery}
        setSelectedProjectId={props.setSelectedProjectId}
        setSidebarView={props.setSidebarView}
        getCategoryById={props.getCategoryById}
        handleCompleteTask={props.handleCompleteTask}
        handleDeleteTask={props.handleDeleteTask}
        handleUncompleteTask={props.handleUncompleteTask}
      />
    );
  }

  if (sidebarView === 'categories' || sidebarView === 'rewards' || sidebarView === 'history') {
    return (
      <CategoriesRewardsView
        viewType={sidebarView}
        tasks={props.tasks}
        categories={props.categories}
        activityLog={props.activityLog}
        earnedRewards={props.earnedRewards}
        isCategoryDialogOpen={props.isCategoryDialogOpen}
        setIsCategoryDialogOpen={props.setIsCategoryDialogOpen}
        isRewardDialogOpen={props.isRewardDialogOpen}
        setIsRewardDialogOpen={props.setIsRewardDialogOpen}
        newCategory={props.newCategory}
        setNewCategory={props.setNewCategory}
        editingCategory={props.editingCategory}
        setEditingCategory={props.setEditingCategory}
        manualRewards={props.manualRewards}
        setManualRewards={props.setManualRewards}
        handleCreateCategory={props.handleCreateCategory}
        handleEditCategory={props.handleEditCategory}
        handleUpdateCategory={props.handleUpdateCategory}
        handleDeleteCategory={props.handleDeleteCategory}
        handleAddManualReward={props.handleAddManualReward}
        handleUndoAction={props.handleUndoAction}
        setEarnedRewards={props.setEarnedRewards}
      />
    );
  }

  return null;
};

export default TaskViews;