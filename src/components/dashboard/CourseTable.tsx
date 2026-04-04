import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseTableProps {
  courses: any[];
  onRefresh: () => void;
}

export default function CourseTable({ courses, onRefresh }: CourseTableProps) {
  const navigate = useNavigate();

  const getStatusBadge = (statut: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'publié': 'default',
      'brouillon': 'secondary',
      'en_revision': 'outline',
      'archivé': 'destructive',
    };

    return <Badge variant={variants[statut] || 'secondary'}>{statut}</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Niveau</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière modification</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">{course.titre}</TableCell>
              <TableCell>{course.matiere?.nom}</TableCell>
              <TableCell>{course.niveau?.nom}</TableCell>
              <TableCell>{getStatusBadge(course.statut)}</TableCell>
              <TableCell>
                {new Date(course.date_modification).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/editorial/cours/${course.id}/preview`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/editorial/cours/${course.id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
