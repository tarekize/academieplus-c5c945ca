import { useEditConflictDetection } from "@/hooks/useEditConflictDetection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Users } from "lucide-react";

interface CourseWithConflictDetectionProps {
  courseId: number;
  currentUserId: string;
  currentUserName: string;
  children: React.ReactNode;
}

export const CourseWithConflictDetection = ({
  courseId,
  currentUserId,
  currentUserName,
  children,
}: CourseWithConflictDetectionProps) => {
  const { activeEditors } = useEditConflictDetection(courseId, currentUserId, currentUserName);

  return (
    <div className="space-y-4">
      {activeEditors.length > 0 && (
        <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-semibold">
              Édition simultanée détectée:
            </span>
            {activeEditors.map((editor, idx) => (
              <span key={editor.user_id}>
                {editor.user_name}
                {idx < activeEditors.length - 1 && ", "}
              </span>
            ))}
            travaillent également sur ce cours. Sauvegardez régulièrement pour éviter les conflits.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  );
};
