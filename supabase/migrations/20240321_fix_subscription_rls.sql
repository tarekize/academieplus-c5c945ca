-- Enable RLS on student_subscriptions if not already enabled
ALTER TABLE student_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow parents to insert subscriptions for their linked children
CREATE POLICY "Parents can insert subscriptions for their children" 
ON student_subscriptions
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM parent_child_links 
    WHERE parent_child_links.parent_id = auth.uid() 
    AND parent_child_links.child_id = student_subscriptions.user_id 
    AND parent_child_links.status = 'active'
  )
);

-- Allow parents to view subscriptions for their linked children
CREATE POLICY "Parents can view subscriptions for their children" 
ON student_subscriptions
FOR SELECT
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM parent_child_links 
    WHERE parent_child_links.parent_id = auth.uid() 
    AND parent_child_links.child_id = student_subscriptions.user_id 
    AND parent_child_links.status = 'active'
  )
);

-- Note: student_subscriptions table should already have policies for students to view their own subscriptions (user_id = auth.uid())
-- If not present, add:
CREATE POLICY "Students can view own subscriptions" 
ON student_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
