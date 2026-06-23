import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManualContentForm from "./ManualContentForm";
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

  const fixedClassIds = mode === "class" && classId ? [classId] : undefined;
  const fixedStudentIds = mode === "student" && studentId ? [studentId] : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "class" ? `Aider les élèves — ${targetName}` : `Aider l'élève — ${targetName}`}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="ai">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="ai">Assistant IA</TabsTrigger>
            <TabsTrigger value="exercise">Exercices</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            {mode === "class" && <TabsTrigger value="exam">Examens</TabsTrigger>}
          </TabsList>

          <TabsContent value="ai" className="pt-4">
            <HelpChatbot
              teacherId={teacherId}
              mode={mode}
              schoolLevel={schoolLevel}
              classId={classId}
              studentIds={studentIds}
              studentId={studentId}
              targetName={targetName}
            />
          </TabsContent>

          <TabsContent value="exercise" className="pt-4">
            <ManualContentForm
              teacherId={teacherId} contentType="exercise"
              fixedClassIds={fixedClassIds} fixedStudentIds={fixedStudentIds}
              fixedLevel={schoolLevel} targetLabel={targetName}
            />
          </TabsContent>

          <TabsContent value="quiz" className="pt-4">
            <ManualContentForm
              teacherId={teacherId} contentType="quiz"
              fixedClassIds={fixedClassIds} fixedStudentIds={fixedStudentIds}
              fixedLevel={schoolLevel} targetLabel={targetName}
            />
          </TabsContent>

          {mode === "class" && (
            <TabsContent value="exam" className="pt-4">
              <ManualContentForm
                teacherId={teacherId} contentType="exam"
                fixedClassIds={fixedClassIds}
                fixedLevel={schoolLevel} targetLabel={targetName}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
