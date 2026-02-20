import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";

// Static FAQ items since the table doesn't exist in the database
interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

const defaultFAQItems: FAQItem[] = [
  {
    id: "1",
    question: "Comment fonctionne l'abonnement ?",
    answer: "L'abonnement vous donne accès à tous les cours et exercices de la plateforme.",
    category: "paiement",
    order_index: 1,
    is_active: true,
  },
  {
    id: "2",
    question: "Comment contacter le support ?",
    answer: "Vous pouvez nous contacter via la page Contact ou par email.",
    category: "general",
    order_index: 2,
    is_active: true,
  },
];

const FAQAdmin = () => {
  const [items, setItems] = useState<FAQItem[]>(defaultFAQItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    order_index: 0,
    is_active: true,
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setItems(prev => prev.map(item => 
        item.id === editingId 
          ? { ...item, ...formData }
          : item
      ));
      toast({
        title: "Succès",
        description: "Question FAQ mise à jour",
      });
    } else {
      const newItem: FAQItem = {
        id: Date.now().toString(),
        ...formData,
      };
      setItems(prev => [...prev, newItem]);
      toast({
        title: "Succès",
        description: "Nouvelle question FAQ ajoutée",
      });
    }

    setFormData({
      question: "",
      answer: "",
      category: "general",
      order_index: 0,
      is_active: true,
    });
    setEditingId(null);
  };

  const handleEdit = (item: FAQItem) => {
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order_index: item.order_index,
      is_active: item.is_active,
    });
    setEditingId(item.id);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette question ?")) return;
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Succès",
      description: "Question FAQ supprimée",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Gestion des FAQ</h1>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Modifier" : "Ajouter"} une question FAQ</CardTitle>
          <CardDescription>
            Créez ou modifiez les questions fréquemment posées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                placeholder="Entrez la question..."
              />
            </div>

            <div>
              <Label htmlFor="answer">Réponse</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                placeholder="Entrez la réponse..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="cours">Cours</SelectItem>
                    <SelectItem value="paiement">Paiement</SelectItem>
                    <SelectItem value="compte">Compte</SelectItem>
                    <SelectItem value="technique">Technique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="order">Ordre d'affichage</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Question active</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? "Mettre à jour" : "Ajouter"}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      question: "",
                      answer: "",
                      category: "general",
                      order_index: 0,
                      is_active: true,
                    });
                  }}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Questions existantes</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Aucune question FAQ pour le moment</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.question}</CardTitle>
                        <CardDescription>
                          {item.category} • Ordre: {item.order_index} • {item.is_active ? "Active" : "Inactive"}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQAdmin;
