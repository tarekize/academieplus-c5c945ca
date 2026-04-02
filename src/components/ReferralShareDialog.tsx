import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageSquare, Share2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FaWhatsapp, FaFacebookMessenger, FaFacebook, FaTwitter } from "react-icons/fa";

interface ReferralShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralUrl: string;
  referralCode: string;
}

export const ReferralShareDialog = ({
  open,
  onOpenChange,
  referralUrl,
  referralCode,
}: ReferralShareDialogProps) => {
  const { toast } = useToast();

  const shareMessage = `Rejoins-moi sur AcadémiePlus de soutien scolaire ! Utilise mon code de parrainage : ${referralCode} et nous recevrons tous les deux 5% de réduction ! ${referralUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien de parrainage a été copié dans le presse-papier.",
      });
    } catch (error) {
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement("textarea");
      textArea.value = referralUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast({
          title: "Lien copié !",
          description: "Le lien de parrainage a été copié dans le presse-papier.",
        });
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de copier le lien. Veuillez le copier manuellement.",
          variant: "destructive",
        });
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  const handleShareEmail = () => {
    const subject = "Rejoins-moi sur AcadémiePlus !";
    const body = shareMessage;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleShareSMS = () => {
    window.location.href = `sms:?&body=${encodeURIComponent(shareMessage)}`;
  };

  const handleShareMessenger = () => {
    const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(referralUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`;
    window.open(url, "_blank");
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-50"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fermer</span>
        </button>
        
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Partagez votre lien de parrainage
            </DialogTitle>
          </DialogHeader>

          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex items-center gap-4 border border-blue-100">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg">
              <Share2 className="h-7 w-7" />
            </div>
            <p className="text-gray-700 font-medium text-base">
              Partagez avec vos amis et gagnez 5% de réduction !
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200"
              onClick={handleCopyLink}
            >
              <Copy className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-gray-900">Copier le lien</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200"
              onClick={handleShareEmail}
            >
              <Mail className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-gray-900">E-mail</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200"
              onClick={handleShareSMS}
            >
              <MessageSquare className="h-5 w-5 mr-3 text-gray-600" />
              <span className="text-gray-900">Messages</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200"
              onClick={handleShareWhatsApp}
            >
              <FaWhatsapp className="h-5 w-5 mr-3 text-green-500" />
              <span className="text-gray-900">WhatsApp</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200"
              onClick={handleShareMessenger}
            >
              <FaFacebookMessenger className="h-5 w-5 mr-3 text-blue-500" />
              <span className="text-gray-900">Messenger</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200"
              onClick={handleShareFacebook}
            >
              <FaFacebook className="h-5 w-5 mr-3 text-blue-600" />
              <span className="text-gray-900">Facebook</span>
            </Button>

            <Button
              variant="outline"
              className="h-16 justify-start text-left font-medium hover:bg-gray-50 border-gray-200 col-span-2"
              onClick={handleShareTwitter}
            >
              <FaTwitter className="h-5 w-5 mr-3 text-sky-500" />
              <span className="text-gray-900">Twitter</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
