import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import HelpChatbot from "./HelpChatbot";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  teacherId: string;
  mode: "class" | "student";
  schoolLevel: string | null;
  classId?: string;
  studentIds?: string[];
  studentId?: string;
  targetName: string;
}

export default function HelpDialog(props: Props) {
  const { open, onOpenChange, teacherId, mode, schoolLevel, classId, studentIds, studentId, targetName } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "class" ? `Aider les élèves — ${targetName}` : `Aider l'élève — ${targetName}`}
          </DialogTitle>
        </DialogHeader>
        <HelpChatbot
          teacherId={teacherId}
          mode={mode}
          schoolLevel={schoolLevel}
          classId={classId}
          studentIds={studentIds}
          studentId={studentId}
          targetName={targetName}
        />
      </DialogContent>
    </Dialog>
  );
}
