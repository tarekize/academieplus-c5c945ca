
-- Drop existing foreign keys and re-create with CASCADE
ALTER TABLE public.parent_child_links
  DROP CONSTRAINT IF EXISTS parent_child_links_child_id_fkey;

ALTER TABLE public.parent_child_links
  ADD CONSTRAINT parent_child_links_child_id_fkey
  FOREIGN KEY (child_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.parent_child_links
  DROP CONSTRAINT IF EXISTS parent_child_links_parent_id_fkey;

ALTER TABLE public.parent_child_links
  ADD CONSTRAINT parent_child_links_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
