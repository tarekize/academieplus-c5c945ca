import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface MetadataPanelProps {
  course: any;
  onChange: (course: any) => void;
}

export function MetadataPanel({ course, onChange }: MetadataPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="p-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h3 className="text-lg font-semibold">SEO & Metadata</h3>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">
              Meta Title
              <span className="text-xs text-muted-foreground ml-2">
                ({course.meta_title?.length || 0}/60 caractères)
              </span>
            </Label>
            <Input
              id="meta-title"
              value={course.meta_title}
              onChange={(e) =>
                onChange({ ...course, meta_title: e.target.value.slice(0, 60) })
              }
              placeholder="Titre optimisé pour les moteurs de recherche"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">
              Meta Description
              <span className="text-xs text-muted-foreground ml-2">
                ({course.meta_description?.length || 0}/160 caractères)
              </span>
            </Label>
            <Textarea
              id="meta-description"
              value={course.meta_description}
              onChange={(e) =>
                onChange({
                  ...course,
                  meta_description: e.target.value.slice(0, 160),
                })
              }
              placeholder="Description pour les résultats de recherche"
              rows={3}
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug (URL)
              <span className="text-xs text-muted-foreground ml-2">
                (auto-généré)
              </span>
            </Label>
            <Input
              id="slug"
              value={course.slug}
              onChange={(e) =>
                onChange({ ...course, slug: e.target.value })
              }
              placeholder="url-du-cours"
            />
            <p className="text-xs text-muted-foreground">
              URL: /ressources/{course.slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description courte</Label>
            <Textarea
              id="description"
              value={course.description}
              onChange={(e) =>
                onChange({ ...course, description: e.target.value })
              }
              placeholder="Courte description du cours (pour l'accueil)"
              rows={3}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
