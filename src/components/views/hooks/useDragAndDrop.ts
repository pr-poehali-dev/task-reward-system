import { useState } from 'react';
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Task, Section, Project } from '@/types/task';

interface UseDragAndDropProps {
  tasks: Task[];
  sections: Section[];
  selectedProjectId: string;
  projects: Project[];
  setTasks: (tasks: Task[]) => void;
  setProjects?: (projects: Project[]) => void;
}

export const useDragAndDrop = ({
  tasks,
  sections,
  selectedProjectId,
  projects,
  setTasks,
  setProjects,
}: UseDragAndDropProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);

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
    
    if (!over) {
      setActiveTask(null);
      setActiveSection(null);
      setOverSectionId(null);
      return;
    }

    // Перемещение задач внутри одного раздела
    if (activeTask && active.id !== over.id) {
      const activeTaskData = tasks.find(t => t.id === active.id);
      const overTask = tasks.find(t => t.id === over.id);
      
      if (activeTaskData && overTask && activeTaskData.sectionId === overTask.sectionId) {
        const sectionTasks = tasks.filter(t => t.sectionId === activeTaskData.sectionId && t.projectId === selectedProjectId && !t.completed);
        const activeIndex = sectionTasks.findIndex(t => t.id === active.id);
        const overIndex = sectionTasks.findIndex(t => t.id === over.id);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          const reorderedTasks = arrayMove(sectionTasks, activeIndex, overIndex);
          const otherTasks = tasks.filter(t => 
            t.sectionId !== activeTaskData.sectionId || t.projectId !== selectedProjectId || t.completed
          );
          setTasks([...otherTasks, ...reorderedTasks]);
        }
      }
    }
    
    // Перемещение разделов
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

  return {
    activeTask,
    activeSection,
    overSectionId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};
