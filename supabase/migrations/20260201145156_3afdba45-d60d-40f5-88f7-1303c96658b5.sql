-- Ensure each student has a unique linking code (used by parents to link accounts)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_linking_code_unique
ON public.profiles (linking_code)
WHERE linking_code IS NOT NULL;

-- Prevent duplicate parent->child links
CREATE UNIQUE INDEX IF NOT EXISTS parent_child_links_parent_child_unique
ON public.parent_child_links (parent_id, child_id);

-- Helpful indexes for lookups
CREATE INDEX IF NOT EXISTS parent_child_links_parent_id_idx ON public.parent_child_links (parent_id);
CREATE INDEX IF NOT EXISTS parent_child_links_child_id_idx ON public.parent_child_links (child_id);