import { Download, FileText, Link, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Document {
  id: string;
  title: string;
  type: "pdf" | "image" | "link";
  url: string;
}

interface DocumentListProps {
  documents: Document[];
}

export const DocumentList = ({ documents }: DocumentListProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "image":
        return <Image className="h-5 w-5 text-blue-500" />;
      case "link":
        return <Link className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <Download className="h-5 w-5" />
        Documents et ressources
      </h3>
      
      <div className="grid gap-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {getIcon(doc.type)}
                  <span className="font-medium">{doc.title}</span>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={doc.type === "pdf"}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {doc.type === "pdf" ? "Télécharger" : "Ouvrir"}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};