import { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import type { Task, Category, Project, RewardType } from '@/types/task';
import { SortableSection } from './SortableComponents';
import TaskEditDialog from './TaskEditDialog';
import SectionCard from './SectionCard';
import NoSectionTasksCard from './NoSectionTasksCard';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';

interface ProjectsViewProps {
  tasks: Task[];
  categories: Category[];
  projects: Project[];
  selectedProjectId: string;
  selectedProject: Project | undefined;
  isSectionDialogOpen: boolean;
  setIsSectionDialogOpen: (open: boolean) => void;
  newSection: { name: string };
  setNewSection: (section: any) => void;
  newTask: {
    title: string;
    description: string;
    category: string;
    rewardType: RewardType;
    rewardAmount: number;
    sectionId: string;
  };
  setNewTask: (task: any) => void;
  handleCreateTask: (overrideSectionId?: string) => void;
  handleCreateSection: () => void;
  handleDeleteSection: (id: string) => void;
  handleCompleteTask: (id: string) => void;
  handleDeleteTask: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  setProjects?: (projects: Project[]) => void;
  setSelectedProjectId?: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
}

const ProjectsView = (props: ProjectsViewProps) => {
  const {
    tasks,
    categories,
    projects,
    selectedProjectId,
    selectedProject,
    isSectionDialogOpen,
    setIsSectionDialogOpen,
    newSection,
    setNewSection,
    newTask,
    setNewTask,
    handleCreateTask,
    handleCreateSection,
    handleDeleteSection,
    handleCompleteTask,
    handleDeleteTask,
    setProjects,
    setTasks,
  } = props;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sections = selectedProject?.sections || [];
  const activeTasks = tasks.filter(t => !t.completed && t.projectId === selectedProjectId);
  const noSectionTasks = activeTasks.filter(t => !t.sectionId);

  const {
    activeTask,
    activeSection,
    overSectionId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragAndDrop({
    tasks,
    sections,
    selectedProjectId,
    projects,
    setTasks,
    setProjects,
  });

  const {
    scrollContainerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
  } = useHorizontalScroll();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [addingToSection, setAddingToSection] = useState<string | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      rewardType: task.rewardType,
      rewardAmount: task.rewardAmount,
      deadline: task.deadline,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === editingTask.id ? { ...t, ...editForm } : t
    );
    setTasks(updatedTasks);
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleAddTask = (sectionId: string) => {
    setAddingToSection(sectionId);
    setNewTask({
      ...newTask,
      sectionId: sectionId === 'none' ? '' : sectionId,
    });
  };

  const handleCreateTaskInSection = (sectionId: string) => {
    handleCreateTask(sectionId === 'none' ? '' : sectionId);
    setAddingToSection(null);
  };

  const handleMoveSection = (sectionId: string, targetProjectId: string) => {
    if (!setProjects) return;
    
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const updatedProjects = projects.map(p => {
      if (p.id === section.projectId) {
        return { ...p, sections: p.sections.filter(s => s.id !== sectionId) };
      }
      if (p.id === targetProjectId) {
        return { 
          ...p, 
          sections: [...p.sections, { ...section, projectId: targetProjectId }] 
        };
      }
      return p;
    });
    setProjects(updatedProjects);
    
    const updatedTasks = tasks.map(t =>
      t.sectionId === sectionId ? { ...t, projectId: targetProjectId } : t
    );
    setTasks(updatedTasks);
  };

  const handleRenameSection = (sectionId: string, newName: string) => {
    if (!setProjects) return;
    
    const updatedProjects = projects.map(p => {
      if (p.id === selectedProjectId) {
        return {
          ...p,
          sections: p.sections.map(s => 
            s.id === sectionId ? { ...s, name: newName } : s
          )
        };
      }
      return p;
    });
    setProjects(updatedProjects);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{selectedProject?.name || 'Проекты'}</h2>
          <p className="text-muted-foreground">Управление задачами по разделам</p>
        </div>
        <Button onClick={() => setIsSectionDialogOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить раздел
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <NoSectionTasksCard
          noSectionTasks={noSectionTasks}
          addingToSection={addingToSection}
          newTask={newTask}
          categories={categories}
          onEditTask={handleEditTask}
          onCompleteTask={handleCompleteTask}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onCancelAdd={() => setAddingToSection(null)}
          onNewTaskChange={setNewTask}
          onCreateTask={handleCreateTaskInSection}
        />

        <SortableContext items={sections.map(s => s.id)} strategy={horizontalListSortingStrategy}>
          <div 
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 cursor-grab"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            style={{ scrollbarWidth: 'thin' }}
          >
            {sections.sort((a, b) => (a.order || 0) - (b.order || 0)).map(section => {
              const sectionTasks = activeTasks.filter(t => t.sectionId === section.id);
              
              return (
                <SortableSection key={section.id} section={section}>
                  {({ dragHandleProps }) => (
                    <SectionCard
                      section={section}
                      sectionTasks={sectionTasks}
                      categories={categories}
                      projects={projects}
                      currentProjectId={selectedProjectId}
                      isOver={overSectionId === section.id}
                      addingToSection={addingToSection}
                      dragHandleProps={dragHandleProps}
                      newTask={newTask}
                      onDeleteSection={handleDeleteSection}
                      onEditTask={handleEditTask}
                      onCompleteTask={handleCompleteTask}
                      onDeleteTask={handleDeleteTask}
                      onAddTask={handleAddTask}
                      onCancelAdd={() => setAddingToSection(null)}
                      onNewTaskChange={(field, value) => setNewTask({ ...newTask, [field]: value })}
                      onCreateTask={handleCreateTaskInSection}
                      onMoveSection={handleMoveSection}
                      onRenameSection={handleRenameSection}
                    />
                  )}
                </SortableSection>
              );
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeTask ? (
            <Card className="p-3 opacity-80 shadow-lg w-80">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium">{activeTask.title}</h4>
                <Badge variant="outline" className="text-xs">P{activeTask.priority || 2}</Badge>
              </div>
              {activeTask.description && (
                <p className="text-sm text-muted-foreground">{activeTask.description}</p>
              )}
            </Card>
          ) : activeSection ? (
            <Card className="p-4 opacity-80 shadow-lg w-80">
              <h3 className="font-semibold">{activeSection.name}</h3>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editForm={editForm}
        categories={categories}
        onFormChange={(field, value) => setEditForm({ ...editForm, [field]: value })}
        onSave={handleSaveEdit}
      />

      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать раздел</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Название раздела"
              value={newSection.name}
              onChange={(e) => setNewSection({ name: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsSectionDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleCreateSection}>Создать</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsView;
