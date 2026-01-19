export type RewardType = 'points' | 'minutes' | 'rubles';
export type ViewMode = 'list' | 'board';
export type SidebarView = 'projects' | 'search' | 'completed' | 'categories' | 'rewards' | 'history';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  sections: Section[];
}

export interface Section {
  id: string;
  name: string;
  projectId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardType: RewardType;
  rewardAmount: number;
  completed: boolean;
  createdAt: Date;
  scheduledDate?: Date;
  projectId: string;
  sectionId?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
}

export interface EarnedRewards {
  points: number;
  minutes: number;
  rubles: number;
}

export const ICONS_LIST = ['Star', 'Heart', 'Zap', 'Trophy', 'Target', 'Award', 'Flag', 'Rocket', 'Crown', 'Gift', 'Sparkles', 'Coffee', 'BookOpen', 'Code', 'Music', 'Camera', 'Palette', 'Briefcase', 'Home', 'User', 'Folder', 'FolderOpen', 'Package'];
export const COLORS_LIST = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500'];