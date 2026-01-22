import { useState, useRef } from 'react';
import { DndContext, closestCenter, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import type { Task, Category, Project, Section, RewardType } from '@/types/task';
import { SortableSection, SortableTask, DroppableArea } from './SortableComponents';
import TaskEditDialog from './TaskEditDialog';
import SectionCard from './SectionCard';

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
    getCategoryById,
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

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [addingToSection, setAddingToSection] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.task-card, .section-card-content')) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
    container.style.userSelect = 'none';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.userSelect = 'auto';
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
      return;
    }
    
    const section = sections.find(s => s.id === active.id);
    if (section) {
      setActiveSection(section);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverSectionId(null);
      return;
    }

    const activeTask = tasks.find(t => t.id === active.id);
    if (activeTask) {
      const overTask = tasks.find(t => t.id === over.id);
      const overSection = over.id;

      if (overTask && activeTask.sectionId !== overTask.sectionId) {
        const updatedTasks = tasks.map(t =>
          t.id === activeTask.id ? { ...t, sectionId: overTask.sectionId } : t
        );
        setTasks(updatedTasks);
      } else if (typeof overSection === 'string' && overSection.startsWith('droppable-')) {
        const newSectionId = overSection.replace('droppable-', '');
        if (activeTask.sectionId !== newSectionId) {
          const updatedTasks = tasks.map(t =>
            t.id === activeTask.id ? { ...t, sectionId: newSectionId === 'none' ? '' : newSectionId } : t
          );
          setTasks(updatedTasks);
        }
      }
    }

    if (activeSection && over) {
      const overId = over.id as string;
      let targetSectionId = overId;
      
      if (overId.startsWith('droppable-')) {
        targetSectionId = overId.replace('droppable-', '');
      }
      
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && overTask.sectionId) {
        targetSectionId = overTask.sectionId;
      }
      
      const targetSection = sections.find(s => s.id === targetSectionId);
      if (targetSection && targetSection.id !== activeSection.id) {
        setOverSectionId(targetSection.id);
      } else {
        setOverSectionId(null);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (activeSection && over && setProjects && active.id !== over.id) {
      const overId = over.id as string;
      let targetSectionId = overId;
      
      if (overId.startsWith('droppable-')) {
        targetSectionId = overId.replace('droppable-', '');
      }
      
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && overTask.sectionId) {
        targetSectionId = overTask.sectionId;
      }
      
      const activeIndex = sections.findIndex(s => s.id === active.id);
      const overIndex = sections.findIndex(s => s.id === targetSectionId);
      
      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const reorderedSections = arrayMove(sections, activeIndex, overIndex);
        const updatedSections = reorderedSections.map((s, idx) => ({ ...s, order: idx }));
        
        const updatedProjects = projects.map(p => 
          p.id === selectedProjectId 
            ? { ...p, sections: updatedSections }
            : p
        );
        setProjects(updatedProjects);
      }
    }
    
    setActiveTask(null);
    setActiveSection(null);
    setOverSectionId(null);
  };

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

  const sections = selectedProject?.sections || [];
  const activeTasks = tasks.filter(t => !t.completed && t.projectId === selectedProjectId);
  const noSectionTasks = activeTasks.filter(t => !t.sectionId);

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
        {noSectionTasks.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Без раздела</h3>
              <Badge variant="outline">{noSectionTasks.length}</Badge>
            </div>

            <DroppableArea id="droppable-none">
              <div className="space-y-2">
                <SortableContext items={noSectionTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {noSectionTasks.map(task => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onComplete={handleCompleteTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </SortableContext>
              </div>
            </DroppableArea>

            {addingToSection === 'none' ? (
              <Card className="p-3 mt-2 space-y-2">
                <Input
                  placeholder="Название задачи"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
                <Textarea
                  placeholder="Описание"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={2}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newTask.category} onValueChange={(v) => setNewTask({ ...newTask, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newTask.rewardType} onValueChange={(v) => setNewTask({ ...newTask, rewardType: v as RewardType })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Награда" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">⭐ Баллы</SelectItem>
                      <SelectItem value="minutes">⏱️ Минуты</SelectItem>
                      <SelectItem value="money">💰 Деньги</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  placeholder="Сумма"
                  value={newTask.rewardAmount}
                  onChange={(e) => setNewTask({ ...newTask, rewardAmount: Number(e.target.value) })}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleCreateTaskInSection('none')} disabled={!newTask.title.trim()}>Создать</Button>
                  <Button size="sm" variant="outline" onClick={() => setAddingToSection(null)}>Отмена</Button>
                </div>
              </Card>
            ) : (
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => handleAddTask('none')}>
                <Icon name="Plus" size={14} className="mr-2" />
                Добавить задачу
              </Button>
            )}
          </Card>
        )}

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