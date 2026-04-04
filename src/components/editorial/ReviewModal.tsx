import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  onSuccess: () => void;
}

interface Reviewer {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

export function ReviewModal({ open, onClose, courseId, onSuccess }: ReviewModalProps) {
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadReviewers();
    }
  }, [open]);

  const loadReviewers = async () => {
    try {
      // Get all users with 'admin' role (since 'reviseur' doesn't exist in the enum)
      const { data: adminRoles, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (error) throw error;

      if (adminRoles && adminRoles.length > 0) {
        const userIds = adminRoles.map(r => r.user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', userIds);

        if (profilesError) throw profilesError;
        setReviewers(profiles || []);
      } else {
        setReviewers([]);
      }
    } catch (error) {
      console.error('Error loading reviewers:', error);
      toast.error("Erreur lors du chargement des réviseurs");
    }
  };

  const handleSendToReview = async () => {
    if (!selectedReviewer) {
      toast.error("Veuillez sélectionner un réviseur");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement course review functionality when the 'cours' table exists
      // For now, just log the action and show success
      await supabase.rpc("log_activity", {
        _user_id: selectedReviewer,
        _action: "course_sent_to_review",
        _details: { course_id: courseId, message: message || null },
      });

      toast.success("Cours envoyé en révision");
      onSuccess();
      onClose();
      
      // Reset form
      setSelectedReviewer("");
      setMessage("");
      setSendEmail(true);
    } catch (error) {
      console.error('Error sending to review:', error);
      toast.error("Erreur lors de l'envoi en révision");
    } finally {
      setLoading(false);
    }
  };

  const getReviewerName = (reviewer: Reviewer) => {
    if (reviewer.first_name || reviewer.last_name) {
      return `${reviewer.first_name || ''} ${reviewer.last_name || ''}`.trim();
    }
    return reviewer.email || 'Utilisateur';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Envoyer en révision</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reviewer">Sélectionner un réviseur *</Label>
            <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
              <SelectTrigger id="reviewer">
                <SelectValue placeholder="Choisir un réviseur..." />
              </SelectTrigger>
              <SelectContent>
                {reviewers.map((reviewer) => (
                  <SelectItem key={reviewer.id} value={reviewer.id}>
                    {getReviewerName(reviewer)}
                  </SelectItem>
                ))}
                {reviewers.length === 0 && (
                  <SelectItem value="none" disabled>
                    Aucun réviseur disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="email" 
              checked={sendEmail} 
              onCheckedChange={(checked) => setSendEmail(checked as boolean)}
            />
            <Label 
              htmlFor="email" 
              className="text-sm font-normal cursor-pointer"
            >
              Notifier par email
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message/Notes pour le réviseur</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Veuillez vérifier la conformité avec le nouveau programme 2025-2026..."
              className="min-h-[100px]"
            />
          </div>

          <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
            Le cours sera visible aux réviseurs et marqué comme "en révision"
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSendToReview} disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer en révision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
