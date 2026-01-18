import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { SidebarView } from '@/types/task';

interface TaskSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarView: SidebarView;
  setSidebarView: (view: SidebarView) => void;
}

export const TaskSidebar = ({ sidebarOpen, setSidebarOpen, sidebarView, setSidebarView }: TaskSidebarProps) => {
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
            variant={sidebarView === 'projects' ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
            onClick={() => setSidebarView('projects')}
          >
            <Icon name="Folder" size={20} />
            {sidebarOpen && 'Проекты'}
          </Button>
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
            variant={sidebarView === 'categories' ? 'secondary' : 'ghost'}
            className={`w-full justify-start gap-2 ${!sidebarOpen && 'px-2'}`}
            onClick={() => setSidebarView('categories')}
          >
            <Icon name="Tag" size={20} />
            {sidebarOpen && 'Категории'}
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default TaskSidebar;
