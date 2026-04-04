import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface PreviewSidebarProps {
  course: any;
  matieres: any[];
  niveaux: any[];
}

export function PreviewSidebar({ course, matieres, niveaux }: PreviewSidebarProps) {
  const matiere = matieres.find(m => m.id === course.matiere_id);
  const niveau = niveaux.find(n => n.id === course.niveau_id);

  const getSectionClass = (type: string) => {
    const classes: { [key: string]: string } = {
      'definition': 'section-definition',
      'propriete': 'section-propriete',
      'exemple': 'section-exemple',
      'remarque': 'section-remarque',
      'methode': 'section-methode'
    };
    return classes[type] || classes['remarque'];
  };

  return (
    <div className="w-96 bg-muted/30 border-l h-full overflow-y-auto">
      <div className="p-4 border-b bg-background sticky top-0 z-10">
        <h3 className="font-semibold">Prévisualisation</h3>
        <p className="text-xs text-muted-foreground">Vue élève en temps réel</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Course header */}
        {course.titre && (
          <Card className="p-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {matiere && (
                <Badge variant="secondary" className="text-xs">{matiere.nom}</Badge>
              )}
              {niveau && (
                <Badge variant="secondary" className="text-xs">{niveau.nom}</Badge>
              )}
            </div>
            <h2 className="text-lg font-bold mb-2">{course.titre}</h2>
            {course.description && (
              <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {course.duree_lecture > 0 && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{course.duree_lecture} min</span>
                </div>
              )}
              {course.difficulte > 0 && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span>Difficulté: {course.difficulte}/5</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Sections */}
        {course.sections && course.sections.length > 0 ? (
          <div className="space-y-3">
            {course.sections.map((section: any, index: number) => (
              <Card key={index} className={`p-3 ${getSectionClass(section.type)}`}>
                <Badge variant="outline" className="mb-2 text-xs capitalize">
                  {section.type}
                </Badge>
                <h3 className="font-semibold text-sm mb-2">{section.titre || 'Sans titre'}</h3>
                
                {section.contenu_texte && (
                  <div className="prose prose-sm max-w-none text-xs" style={{ whiteSpace: 'pre-wrap' }}>
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p style={{ whiteSpace: 'pre-wrap' }} {...props} />
                      }}
                    >
                      {section.contenu_texte}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Formulas */}
                {section.formules && section.formules.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {section.formules.map((formule: any, fIndex: number) => (
                      <div key={fIndex} className="bg-background/50 p-2 rounded text-xs">
                        {formule.display_mode ? (
                          <div className="text-center">
                            <BlockMath math={formule.latex_source} />
                          </div>
                        ) : (
                          <InlineMath math={formule.latex_source} />
                        )}
                        {formule.legende && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {formule.legende}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Images */}
                {section.medias && section.medias.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {section.medias.map((media: any, mIndex: number) => (
                      <div key={mIndex} className="bg-background/50 p-2 rounded">
                        <img
                          src={media.url}
                          alt={media.alt_text || ''}
                          className="rounded max-w-full h-auto"
                        />
                        {media.legende && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            {media.legende}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Ajoutez des sections pour voir la prévisualisation
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
