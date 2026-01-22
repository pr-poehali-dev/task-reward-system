import { useState, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Task, Category, Project, Section, RewardType } from '@/types/task';

interface SortableSectionProps {
  section: Section;
  children: React.ReactNode;
}

const SortableSection = ({ section, children }: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="cursor-move p-2 -m-2 mb-2">
        <Icon name="GripVertical" size={16} className="text-muted-foreground mx-auto" />
      </div>
      {children}
    </div>
  );
};

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
}

const DroppableArea = ({ id, children }: DroppableAreaProps) => {
  const { setNodeRef } = useDroppable({ id });
  return <div ref={setNodeRef}>{children}</div>;
};

interface SortableTaskProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableTask = ({ task, onEdit, onComplete, onDelete }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className="p-3 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onEdit(task)}
    >
      <div className="flex items-center gap-2">
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <Icon name="GripVertical" size={14} className="text-muted-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{task.title}</h4>
            <Badge variant="outline" className="text-xs">
              P{task.priority || 2}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {task.rewardType === 'points' ? '⭐' : task.rewardType === 'minutes' ? '⏱️' : '💰'} {task.rewardAmount}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}>
                <Icon name="Check" size={14} />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}>
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

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
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Task>>({});
  const [addingToSection, setAddingToSection] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setIsDragging(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
    container.style.cursor = 'grabbing';
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
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

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
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeSection = sections.find(s => s.id === active.id);
    const overSection = sections.find(s => s.id === over.id);

    if (activeSection && overSection && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      
      const newSections = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
        ...s,
        order: idx + 1
      }));
      
      if (setProjects) {
        const updatedProjects = projects.map(p => 
          p.id === selectedProjectId 
            ? { ...p, sections: newSections }
            : p
        );
        setProjects(updatedProjects);
      }
    }
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Icon name="Folder" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Выберите проект из меню</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter(
    t => t.projectId === selectedProject.id && !t.completed
  );

  const sections = selectedProject.sections || [];
  const tasksWithoutSection = activeTasks.filter(t => !t.sectionId);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditForm(task);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleAddTask = (sectionId: string) => {
    setNewTask({ ...newTask, title: '', description: '' });
    setAddingToSection(sectionId);
  };

  const handleCreateTaskInSection = (sectionId: string) => {
    if (!newTask.title.trim()) return;

    const finalSectionId = sectionId === 'none' ? '' : sectionId;
    handleCreateTask(finalSectionId);
    setAddingToSection(null);
  };

  if (sections.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <div className={`${selectedProject.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <Icon name={selectedProject.icon} size={20} className="text-white" />
              </div>
              {selectedProject.name}
            </h1>
          </div>
          <Button size="sm" onClick={() => setIsSectionDialogOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Новый раздел
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Icon name="FolderOpen" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">В этом проекте пока нет разделов</p>
            <Button onClick={() => setIsSectionDialogOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать первый раздел
            </Button>
          </div>
        </div>

        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый раздел</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название</label>
                <Input
                  value={newSection.name}
                  onChange={(e) => setNewSection({ name: e.target.value })}
                  placeholder="Название раздела"
                />
              </div>
              <Button onClick={handleCreateSection} className="w-full">Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className={`${selectedProject.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
              <Icon name={selectedProject.icon} size={20} className="text-white" />
            </div>
            {selectedProject.name}
          </h1>
        </div>
        <Button size="sm" onClick={() => setIsSectionDialogOpen(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          Новый раздел
        </Button>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {tasksWithoutSection.length > 0 && (
          <Card className="flex-shrink-0 w-80 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Без раздела</h3>
              <Badge variant="outline">{tasksWithoutSection.length}</Badge>
            </div>
            
            <DroppableArea id="droppable-none">
              <SortableContext items={tasksWithoutSection.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 mb-4">
                {tasksWithoutSection.map(task => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onComplete={handleCompleteTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </SortableContext>
            </DroppableArea>

            {addingToSection === 'none' ? (
              <Card className="p-3 border-dashed">
                <Input
                  placeholder="Название задачи"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleCreateTaskInSection('none')} disabled={!newTask.title.trim()}>Создать</Button>
                  <Button size="sm" variant="outline" onClick={() => setAddingToSection(null)}>Отмена</Button>
                </div>
              </Card>
            ) : (
              <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddTask('none')}>
                <Icon name="Plus" size={14} className="mr-2" />
                Добавить задачу
              </Button>
            )}
          </Card>
        )}

        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
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
                  <Card className="flex-shrink-0 w-80 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{section.name}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{sectionTasks.length}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteSection(section.id)}
                  >
                    <Icon name="Trash2" size={12} />
                  </Button>
                </div>
              </div>
              
              <DroppableArea id={`droppable-${section.id}`}>
                <SortableContext items={sectionTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 mb-4">
                    {sectionTasks.map(task => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onComplete={handleCompleteTask}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableArea>

              {addingToSection === section.id ? (
                <Card className="p-3 border-dashed">
                  <Input
                    placeholder="Название задачи"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleCreateTaskInSection(section.id)} disabled={!newTask.title.trim()}>Создать</Button>
                    <Button size="sm" variant="outline" onClick={() => setAddingToSection(null)}>Отмена</Button>
                  </div>
                </Card>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddTask(section.id)}>
                  <Icon name="Plus" size={14} className="mr-2" />
                  Добавить задачу
                </Button>
              )}
                </Card>
              </SortableSection>
            );
          })}
          </div>
        </SortableContext>
        </div>
      </DndContext>

      {/* Диалог создания раздела */}
      <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Новый раздел</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название</label>
              <Input
                value={newSection.name}
                onChange={(e) => setNewSection({ name: e.target.value })}
                placeholder="Название раздела"
              />
            </div>
            <Button onClick={handleCreateSection} className="w-full">Создать</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования задачи */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название</label>
                <Input
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Приоритет</label>
                <Select
                  value={String(editForm.priority || 2)}
                  onValueChange={(value) => setEditForm({ ...editForm, priority: parseInt(value) as 1 | 2 | 3 | 4 })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Критичный</SelectItem>
                    <SelectItem value="2">2 - Высокий</SelectItem>
                    <SelectItem value="3">3 - Средний</SelectItem>
                    <SelectItem value="4">4 - Низкий</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Тип награды</label>
                  <Select
                    value={editForm.rewardType}
                    onValueChange={(value: RewardType) => setEditForm({ ...editForm, rewardType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Баллы</SelectItem>
                      <SelectItem value="minutes">Минуты</SelectItem>
                      <SelectItem value="rubles">Рубли</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Количество</label>
                  <Input
                    type="number"
                    value={editForm.rewardAmount || 0}
                    onChange={(e) => setEditForm({ ...editForm, rewardAmount: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateTask} className="w-full">Сохранить</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsView;