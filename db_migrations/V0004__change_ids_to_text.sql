-- Изменяем типы в categories
ALTER TABLE categories DROP CONSTRAINT categories_pkey CASCADE;
ALTER TABLE categories ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE categories ADD PRIMARY KEY (id);

-- Изменяем типы в projects
ALTER TABLE projects DROP CONSTRAINT projects_pkey CASCADE;
ALTER TABLE projects ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE projects ADD PRIMARY KEY (id);

-- Изменяем типы в sections
ALTER TABLE sections DROP CONSTRAINT sub_projects_pkey CASCADE;
ALTER TABLE sections ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE sections ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
ALTER TABLE sections ADD PRIMARY KEY (id);
ALTER TABLE sections ADD CONSTRAINT sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);

-- Изменяем типы в tasks
ALTER TABLE tasks DROP CONSTRAINT tasks_pkey CASCADE;
ALTER TABLE tasks ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE tasks ALTER COLUMN project_id TYPE TEXT USING project_id::TEXT;
ALTER TABLE tasks ALTER COLUMN section_id TYPE TEXT USING section_id::TEXT;
ALTER TABLE tasks ALTER COLUMN category_id TYPE TEXT USING category_id::TEXT;
ALTER TABLE tasks ADD PRIMARY KEY (id);
ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_section_id_fkey FOREIGN KEY (section_id) REFERENCES sections(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id);

-- Изменяем типы в activity_logs
ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_pkey CASCADE;
ALTER TABLE activity_logs ALTER COLUMN id TYPE TEXT USING id::TEXT;
ALTER TABLE activity_logs ADD PRIMARY KEY (id);

-- Восстанавливаем внешние ключи для всех таблиц
ALTER TABLE categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE earned_rewards ADD CONSTRAINT earned_rewards_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);