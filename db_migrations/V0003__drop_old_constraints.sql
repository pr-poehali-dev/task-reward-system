-- Удаляем старый constraint из sections
ALTER TABLE sections DROP CONSTRAINT IF EXISTS sub_projects_project_id_fkey;

-- Удаляем старый constraint из tasks  
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_sub_project_id_fkey;