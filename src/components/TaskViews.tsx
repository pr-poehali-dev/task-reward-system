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
        taskViewMode={props.taskViewMode}
        setTaskViewMode={props.setTaskViewMode}
        isTaskDialogOpen={props.isTaskDialogOpen}
        setIsTaskDialogOpen={props.setIsTaskDialogOpen}
        isProjectDialogOpen={props.isProjectDialogOpen}
        setIsProjectDialogOpen={props.setIsProjectDialogOpen}
        isSubProjectDialogOpen={props.isSubProjectDialogOpen}
        setIsSubProjectDialogOpen={props.setIsSubProjectDialogOpen}
        newTask={props.newTask}
        setNewTask={props.setNewTask}
        newProject={props.newProject}
        setNewProject={props.setNewProject}
        newSubProject={props.newSubProject}
        setNewSubProject={props.setNewSubProject}
        editingProject={props.editingProject}
        setEditingProject={props.setEditingProject}
        handleCreateTask={props.handleCreateTask}
        handleCompleteTask={props.handleCompleteTask}
        handleDeleteTask={props.handleDeleteTask}
        handleCreateProject={props.handleCreateProject}
        handleEditProject={props.handleEditProject}
        handleUpdateProject={props.handleUpdateProject}
        handleDeleteProject={props.handleDeleteProject}
        handleCreateSubProject={props.handleCreateSubProject}
        handleDeleteSubProject={props.handleDeleteSubProject}
        getCategoryById={props.getCategoryById}
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
      />
    );
  }

  return null;
};

export default TaskViews;