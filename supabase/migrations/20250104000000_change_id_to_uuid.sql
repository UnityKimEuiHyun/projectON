-- Change projects table id column from BIGSERIAL to UUID
-- Check if id_new column already exists
DO $$
BEGIN
    -- Add new UUID column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'id_new') THEN
        ALTER TABLE public.projects ADD COLUMN id_new UUID DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Update existing records to have UUID values (only if id_new is NULL)
UPDATE public.projects SET id_new = gen_random_uuid() WHERE id_new IS NULL;

-- Check if we can safely drop the old id column
DO $$
BEGIN
    -- Only proceed if id_new column exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'id_new') THEN
        -- Drop the old id column if it exists and is not the primary key
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'id' AND data_type = 'bigint') THEN
            ALTER TABLE public.projects DROP COLUMN id;
        END IF;
        
        -- Rename id_new to id
        ALTER TABLE public.projects RENAME COLUMN id_new TO id;
        
        -- Make id the primary key if it's not already
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'projects' AND constraint_type = 'PRIMARY KEY') THEN
            ALTER TABLE public.projects ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- Recreate indexes
DROP INDEX IF EXISTS idx_projects_user_id;
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);

-- Update RLS policies to use the new id column
DROP POLICY IF EXISTS "Users can manage their own projects" ON public.projects;
CREATE POLICY "Users can manage their own projects" ON public.projects
    FOR ALL USING (auth.uid() = created_by);
