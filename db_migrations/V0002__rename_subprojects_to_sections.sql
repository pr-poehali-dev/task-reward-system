-- Переименование таблицы sub_projects в sections
ALTER TABLE sub_projects RENAME TO sections;

-- Переименование колонки в tasks
ALTER TABLE tasks RENAME COLUMN sub_project_id TO section_id;